"""Pydantic validation schemas for Ask VITTANAYA Chatbot backend API."""

from typing import List, Optional, Union

from pydantic import BaseModel, Field

from backend.app.schemas.insights import TraceabilityMetadata


class ChatMessage(BaseModel):
    """Previous conversation turn in the chat session."""

    sender: str = Field(..., description="Message author: 'user' or 'ai'/'assistant'")
    text: str = Field(..., description="Text content of the message")


class BusinessContextInput(BaseModel):
    """Structured business profile context for grounded advisory context building."""

    business_id: Optional[Union[str, int]] = Field(None, description="Optional DB business ID")
    business_category: Optional[str] = Field(None, description="Industry sector or category")
    specific_business: Optional[str] = Field(None, description="Specific business activity/name")
    location: Optional[str] = Field(None, description="District and state location")
    available_margin_capital: Optional[float] = Field(None, ge=0, description="Own capital available in INR")
    social_category: Optional[str] = Field("General", description="Social category: General / SC / ST / OBC / Women")
    area_type: Optional[str] = Field("Rural", description="Area classification: Rural / Urban")
    scale: Optional[str] = Field(None, description="Scale or bird/unit capacity specification")


class ChatRequest(BaseModel):
    """Payload for POST /api/v1/advisory/chat endpoint."""

    message: str = Field(..., min_length=1, json_schema_extra={"example": "Can I afford this business?"})
    business_id: Optional[Union[str, int]] = Field(None, description="Optional ID of active user business")
    language: str = Field("English", json_schema_extra={"example": "English"})
    business_context: Optional[BusinessContextInput] = Field(default=None, description="Optional business context")
    history: List[ChatMessage] = Field(default_factory=list, description="Recent conversation turns")
    confirmed_action: Optional[dict] = Field(default=None, description="Action confirmed by user for execution")
    confirmed: Optional[bool] = Field(default=None, description="User confirmation state for pending write action")


class KeyFact(BaseModel):
    """Structured key metric or verified fact returned by decision engines."""

    label: str = Field(..., json_schema_extra={"example": "Indicative Project Cost"})
    value: str = Field(..., json_schema_extra={"example": "₹6,47,000"})


class SourceInfo(BaseModel):
    """Authority and reference source badge metadata."""

    name: str = Field(..., json_schema_extra={"example": "NABARD PLP Odisha 2024-25"})
    authority: str = Field(..., json_schema_extra={"example": "NABARD"})
    url: Optional[str] = Field(None)


class NlpMetadata(BaseModel):
    """Local offline NLP model inference metadata."""

    pipeline: str = Field("TF-IDF + Logistic Regression", description="NLP architecture description")
    confidence_score: float = Field(default=0.95, description="Model output confidence probability (0.0 - 1.0)")
    method: str = Field(default="TF_IDF_LOGISTIC_REGRESSION", description="Classification mechanism used")


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
    nlp_metadata: Optional[NlpMetadata] = None
    provenance_label: str = Field("Grounded in VITTANAYA Business Data", description="User-facing subtle provenance badge")
    action_performed: Optional[str] = Field(None, description="Name of tool or action executed")
    confirmation_required: bool = Field(False, description="True if proposed state change requires explicit confirmation")
    confirmation_details: Optional[dict] = Field(None, description="Payload of the action awaiting confirmation")
    navigation_target: Optional[str] = Field(None, description="Optional target tab/page to navigate user e.g. 'feasibility'")
    suggested_actions: List[str] = Field(default_factory=list, description="Contextual quick prompts based on active state")
