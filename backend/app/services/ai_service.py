"""
AI services using OpenAI API.
Includes transcription, summarization, intent classification, and entity extraction.
"""
import os
import json
from typing import Optional, Dict, Any, List
from openai import AsyncOpenAI
import httpx

from app.config import settings

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def transcribe_meeting(audio_file_path: str) -> str:
    """
    Transcribe audio file using OpenAI Whisper API.

    Handles files up to 25MB. For larger files, chunking is recommended.

    Args:
        audio_file_path: Path to the audio file

    Returns:
        Formatted transcript with timestamps

    Raises:
        Exception: If transcription fails
    """
    try:
        # Check file size
        file_size = os.path.getsize(audio_file_path)
        max_size = 25 * 1024 * 1024  # 25MB

        if file_size > max_size:
            raise ValueError(f"File size {file_size} exceeds maximum of {max_size} bytes")

        # Open and transcribe file
        with open(audio_file_path, "rb") as audio_file:
            transcript = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",  # Includes timestamps
                language="en"  # Can be made dynamic
            )

        # Format transcript with timestamps if available
        if hasattr(transcript, 'segments') and transcript.segments:
            formatted_transcript = ""
            for segment in transcript.segments:
                start_time = segment.get('start', 0)
                text = segment.get('text', '')
                formatted_transcript += f"[{format_timestamp(start_time)}] {text}\n"
            return formatted_transcript.strip()

        # Fallback to plain text
        return transcript.text

    except Exception as e:
        raise Exception(f"Transcription failed: {str(e)}")


def format_timestamp(seconds: float) -> str:
    """Format seconds into MM:SS format"""
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes:02d}:{secs:02d}"


async def summarize_meeting(transcript: str, title: str) -> Dict[str, Any]:
    """
    Generate structured summary from meeting transcript using GPT-4.

    Args:
        transcript: Meeting transcript text
        title: Meeting title for context

    Returns:
        Dictionary containing:
        - summary: Formatted summary text
        - action_items: List of extracted action items

    Raises:
        Exception: If summarization fails
    """
    try:
        prompt = f"""You are a professional meeting summarizer. Analyze this meeting transcript and provide a comprehensive summary.

Meeting Title: {title}

Transcript:
{transcript}

Please provide a structured summary with the following sections:

## KEY TOPICS
Summarize the main discussion points (2-3 sentences each).

## DECISIONS MADE
List important decisions made during the meeting (bullet points).

## ACTION ITEMS
Extract specific action items in this format:
- [ ] Task description (Assignee: @name, Deadline: YYYY-MM-DD if mentioned)

## BLOCKERS
List any issues, blockers, or concerns raised.

## NEXT STEPS
Describe what happens next and any follow-up needed.

Use professional tone and be concise but capture all critical details."""

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional meeting summarizer who creates clear, actionable summaries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )

        summary_text = response.choices[0].message.content

        # Extract action items from the summary
        action_items = await extract_action_items_from_summary(summary_text)

        return {
            "summary": summary_text,
            "action_items": action_items
        }

    except Exception as e:
        raise Exception(f"Summarization failed: {str(e)}")


async def extract_action_items_from_summary(summary: str) -> List[Dict[str, Any]]:
    """
    Extract structured action items from summary text.

    Args:
        summary: Summary text containing action items

    Returns:
        List of action item dictionaries
    """
    try:
        prompt = f"""Extract action items from this meeting summary and return them as a JSON array.

For each action item, identify:
- description: The task to be done
- assignee: Person mentioned (name or @mention), null if not specified
- deadline: Date mentioned (YYYY-MM-DD format), null if not specified
- confidence: Your confidence in this extraction (0.0 to 1.0)

Summary:
{summary}

Return ONLY a JSON array, no other text. Format:
[
  {{"description": "Task description", "assignee": "John Doe", "deadline": "2024-03-15", "confidence": 0.9}},
  {{"description": "Another task", "assignee": null, "deadline": null, "confidence": 0.7}}
]

If no action items found, return []."""

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a precise task extractor. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1000
        )

        result_text = response.choices[0].message.content.strip()

        # Parse JSON response
        try:
            action_items = json.loads(result_text)
            return action_items if isinstance(action_items, list) else []
        except json.JSONDecodeError:
            # If parsing fails, return empty list
            return []

    except Exception as e:
        print(f"Action item extraction failed: {str(e)}")
        return []


async def classify_intent(message: str) -> Dict[str, Any]:
    """
    Classify the intent of a message using GPT-3.5-turbo.

    Categories:
    - task_request: User is requesting a task
    - blocker: User is reporting a blocker
    - question: User has a question
    - information: Sharing information
    - urgent_issue: Urgent problem that needs attention
    - casual: Casual conversation

    Args:
        message: Message text to classify

    Returns:
        Dictionary with intent and confidence score
    """
    try:
        prompt = f"""Classify the intent of this message into ONE of these categories:
- task_request: Requesting someone to do something
- blocker: Reporting a problem or blocker
- question: Asking a question
- information: Sharing information or updates
- urgent_issue: Urgent problem requiring immediate attention
- casual: Casual conversation or greeting

Message: "{message}"

Respond with ONLY a JSON object:
{{"intent": "category_name", "confidence": 0.95}}"""

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a message intent classifier. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=50
        )

        result_text = response.choices[0].message.content.strip()

        try:
            result = json.loads(result_text)
            return {
                "intent": result.get("intent", "information"),
                "confidence": float(result.get("confidence", 0.5))
            }
        except (json.JSONDecodeError, ValueError):
            return {"intent": "information", "confidence": 0.5}

    except Exception as e:
        print(f"Intent classification failed: {str(e)}")
        return {"intent": "information", "confidence": 0.0}


async def extract_task_entities(message: str) -> Dict[str, Any]:
    """
    Extract task details from a message using GPT-4 function calling.

    Args:
        message: Message text to analyze

    Returns:
        Dictionary with extracted entities and confidence score
    """
    try:
        functions = [
            {
                "name": "extract_task_entities",
                "description": "Extract task details from a message",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string",
                            "description": "Clear description of the task"
                        },
                        "assignee": {
                            "type": "string",
                            "description": "Person responsible (name or email), null if not specified"
                        },
                        "deadline": {
                            "type": "string",
                            "description": "Deadline in ISO 8601 format (YYYY-MM-DD), null if not specified"
                        },
                        "priority": {
                            "type": "string",
                            "enum": ["low", "medium", "high", "urgent"],
                            "description": "Task priority based on urgency words"
                        }
                    },
                    "required": ["description", "priority"]
                }
            }
        ]

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Extract task information from messages."},
                {"role": "user", "content": f"Extract task details from: {message}"}
            ],
            functions=functions,
            function_call={"name": "extract_task_entities"},
            temperature=0.2
        )

        # Parse function call response
        message_response = response.choices[0].message

        if message_response.function_call:
            try:
                entities = json.loads(message_response.function_call.arguments)
                entities["confidence"] = 0.8  # Base confidence for function calling
                return entities
            except json.JSONDecodeError:
                pass

        return {"confidence": 0.0}

    except Exception as e:
        print(f"Entity extraction failed: {str(e)}")
        return {"confidence": 0.0}


async def chat_query(query: str, context: Dict[str, Any]) -> str:
    """
    Process a natural language query about tasks, meetings, or team info.

    Args:
        query: User's natural language query
        context: Dictionary with relevant data (tasks, meetings, team info)

    Returns:
        Natural language response
    """
    try:
        # Build context prompt
        context_text = f"""You are Synkro AI Assistant, helping a software development team with productivity queries.

Available Data:
{json.dumps(context, indent=2, default=str)}

User Query: {query}

Provide a helpful, conversational response based on the data. If suggesting actions, be specific. If data is missing, acknowledge it politely."""

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are Synkro AI Assistant, a helpful productivity assistant for software teams."},
                {"role": "user", "content": context_text}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"I apologize, but I encountered an error processing your query: {str(e)}"
