"""Pydantic validation schemas for Ask VITTANAYA Chatbot backend API."""

from typing import List, Optional

from pydantic import BaseModel, Field

from backend.app.schemas.insights import TraceabilityMetadata


class ChatMessage(BaseModel):
    """Previous conversation turn in the chat session."""

    sender: str = Field(..., description="Message author: 'user' or 'ai'/'assistant'")
    text: str = Field(..., description="Text content of the message")


class BusinessContextInput(BaseModel):
    """Structured business profile context for grounded advisory context building."""

    business_id: Optional[str] = Field(None, description="Optional DB business UUID")
    business_category: str = Field("Micro-Enterprise", description="Industry sector or category")
    specific_business: str = Field("Micro-Enterprise", description="Specific business activity/name")
    location: str = Field("Odisha", description="District and state location")
    available_margin_capital: float = Field(50000.0, ge=0, description="Own capital available in INR")
    social_category: str = Field("General", description="Social category: General / SC / ST / OBC / Women")
    area_type: str = Field("Rural", description="Area classification: Rural / Urban")
    scale: Optional[str] = Field(None, description="Scale or bird/unit capacity specification")


class ChatRequest(BaseModel):
    """Payload for POST /api/v1/advisory/chat endpoint."""

    message: str = Field(..., min_length=1, json_schema_extra={"example": "Can I afford this business?"})
    business_id: Optional[str] = Field(None, description="Optional UUID of active user business")
    language: str = Field("English", json_schema_extra={"example": "English"})
    business_context: Optional[BusinessContextInput] = Field(default=None, description="Optional business context")
    history: List[ChatMessage] = Field(default_factory=list, description="Recent conversation turns")


class KeyFact(BaseModel):
    """Structured key metric or verified fact returned by decision engines."""

    label: str = Field(..., json_schema_extra={"example": "Indicative Project Cost"})
    value: str = Field(..., json_schema_extra={"example": "₹6,47,000"})


class SourceInfo(BaseModel):
    """Authority and reference source badge metadata."""

    name: str = Field(..., json_schema_extra={"example": "NABARD PLP Odisha 2024-25"})
    authority: str = Field(..., json_schema_extra={"example": "NABARD"})
    url: Optional[str] = Field(None)


class ChatResponse(BaseModel):
    """Structured response from Ask VITTANAYA Chatbot backend API."""

    answer: str = Field(..., description="Grounded natural language explanation")
    intent: str = Field(..., description="Recognized query intent (FINANCIAL, SCHEME, FEASIBILITY, RISK, ACTION, GENERAL)")
    key_facts: List[KeyFact] = Field(default_factory=list, description="Calculated key figures")
    why_this_result: List[str] = Field(default_factory=list, description="Structured explainability points")
    recommended_next_steps: List[str] = Field(default_factory=list, description="Actionable next steps")
    confidence: str = Field("HIGH", description="Confidence level: HIGH, MEDIUM, ESTIMATED")
    sources: List[SourceInfo] = Field(default_factory=list, description="Verified source authorities")
    data_status: str = Field("VERIFIED_DETERMINISTIC", description="Data integrity status")
    language: str = Field("English", description="Target language of response")
    traceability: TraceabilityMetadata
