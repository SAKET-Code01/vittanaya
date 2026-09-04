"""Tests for Groq API Advisor integration (openai/gpt-oss-120b)."""

import json
import urllib.request
from io import BytesIO
from unittest.mock import MagicMock, patch

from backend.app.engines.ai_advisor import (
    AIBusinessAdvisor,
    GroqProvider,
    get_llm_provider,
)
from backend.app.schemas.insights import AdvisorResponse


def test_groq_provider_defaults():
    """Verify GroqProvider initializes with model openai/gpt-oss-120b and Groq endpoint."""
    provider = GroqProvider(api_key="gsk_test_mock_key")
    assert provider.model == "openai/gpt-oss-120b"
    assert provider.endpoint == "https://api.groq.com/openai/v1/chat/completions"
    assert "Groq (openai/gpt-oss-120b)" in provider.provider_name


def test_get_llm_provider_returns_groq():
    """Verify get_llm_provider factory returns GroqProvider by default."""
    provider = get_llm_provider()
    assert isinstance(provider, GroqProvider)
    assert provider.model == "openai/gpt-oss-120b"


def test_groq_provider_absent_key_returns_none():
    """Verify generate returns None when API key is missing, without throwing."""
    provider = GroqProvider(api_key=None)
    result = provider.generate("Analyze business feasibility")
    assert result is None


def test_groq_provider_successful_generation():
    """Verify GroqProvider parses JSON response from Groq chat completions API."""
    mock_response_data = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": json.dumps({
                        "summary": "Your broiler poultry business in Sundargarh shows positive operating margins.",
                        "why_this_result": [
                            "Capital requirement of Rs 65,000 matches PMEGP 5% margin threshold.",
                            "Catchment demand verified from district commercial feed hubs.",
                        ],
                        "recommended_next_steps": [
                            "Register on PMEGP e-portal with DPR.",
                            "Obtain local veterinary clearance.",
                        ],
                    }),
                }
            }
        ]
    }

    mock_resp = MagicMock()
    mock_resp.status = 200
    mock_resp.__enter__.return_value = mock_resp
    mock_resp.read.return_value = json.dumps(mock_response_data).encode("utf-8")

    provider = GroqProvider(api_key="gsk_valid_mock_key")

    with patch.object(urllib.request, "urlopen", return_value=mock_resp):
        result = provider.generate("Summarize findings")
        assert result is not None
        assert "broiler poultry" in result["summary"]
        assert len(result["why_this_result"]) == 2
        assert len(result["recommended_next_steps"]) == 2


def test_groq_provider_markdown_fenced_json():
    """Verify GroqProvider strips markdown code fences if returned by model."""
    fenced_content = "```json\n" + json.dumps({
        "summary": "Markdown fenced output parsed cleanly.",
        "why_this_result": ["Reason A"],
        "recommended_next_steps": ["Step 1"],
    }) + "\n```"

    mock_response_data = {
        "choices": [{"message": {"role": "assistant", "content": fenced_content}}]
    }

    mock_resp = MagicMock()
    mock_resp.status = 200
    mock_resp.__enter__.return_value = mock_resp
    mock_resp.read.return_value = json.dumps(mock_response_data).encode("utf-8")

    provider = GroqProvider(api_key="gsk_valid_mock_key")

    with patch.object(urllib.request, "urlopen", return_value=mock_resp):
        result = provider.generate("Test fenced json")
        assert result is not None
        assert result["summary"] == "Markdown fenced output parsed cleanly."


def test_groq_provider_rate_limit_graceful_fallback():
    """Verify GroqProvider handles HTTP 429 rate limit or quota exhaustion gracefully."""
    provider = GroqProvider(api_key="gsk_rate_limited_key")

    with patch.object(
        urllib.request,
        "urlopen",
        side_effect=urllib.error.HTTPError(
            url="https://api.groq.com/openai/v1/chat/completions",
            code=429,
            msg="Too Many Requests",
            hdrs={},
            fp=BytesIO(b'{"error": {"message": "Rate limit exceeded"}}'),
        ),
    ):
        result = provider.generate("Prompt")
        assert result is None


def test_groq_provider_server_error_graceful_fallback():
    """Verify GroqProvider handles HTTP 503 service unavailable gracefully."""
    provider = GroqProvider(api_key="gsk_server_error_key")

    with patch.object(
        urllib.request,
        "urlopen",
        side_effect=urllib.error.HTTPError(
            url="https://api.groq.com/openai/v1/chat/completions",
            code=503,
            msg="Service Unavailable",
            hdrs={},
            fp=BytesIO(b"Service Unavailable"),
        ),
    ):
        result = provider.generate("Prompt")
        assert result is None


def test_groq_provider_malformed_json_handling():
    """Verify GroqProvider returns None when assistant returns invalid JSON."""
    mock_response_data = {
        "choices": [{"message": {"role": "assistant", "content": "I am not returning JSON today."}}]
    }

    mock_resp = MagicMock()
    mock_resp.status = 200
    mock_resp.__enter__.return_value = mock_resp
    mock_resp.read.return_value = json.dumps(mock_response_data).encode("utf-8")

    provider = GroqProvider(api_key="gsk_valid_mock_key")

    with patch.object(urllib.request, "urlopen", return_value=mock_resp):
        result = provider.generate("Test bad json")
        assert result is None


def test_ai_business_advisor_with_groq_enhancement():
    """Verify AIBusinessAdvisor injects Groq synthesis and sets correct provenance metadata."""
    mock_provider = MagicMock(spec=GroqProvider)
    mock_provider.provider_name = "Groq (openai/gpt-oss-120b)"
    mock_provider.generate.return_value = {
        "summary": "Enhanced Groq advisory for rural enterprise.",
        "why_this_result": ["Grounded fact 1", "Grounded fact 2"],
        "recommended_next_steps": ["Action step 1"],
    }

    advisor = AIBusinessAdvisor(provider=mock_provider)

    with patch.dict("os.environ", {"GROQ_API_KEY": "gsk_live_key"}):
        res = advisor.generate_advice(
            financial={"indicative_project_cost": 500000.0, "available_margin_capital": 50000.0},
            opportunity={"overall_opportunity_score": 68.0, "market_reach": "High"},
        )

    assert isinstance(res, AdvisorResponse)
    assert res.summary == "Enhanced Groq advisory for rural enterprise."
    assert "Groq (openai/gpt-oss-120b)" in res.traceability.source_authority
    assert res.traceability.provenance_priority == "LLM_ENHANCED"


def test_ai_business_advisor_fallback_when_groq_unavailable():
    """Verify AIBusinessAdvisor seamlessly uses deterministic rules when Groq returns None."""
    mock_provider = MagicMock(spec=GroqProvider)
    mock_provider.generate.return_value = None

    advisor = AIBusinessAdvisor(provider=mock_provider)

    with patch.dict("os.environ", {"GROQ_API_KEY": "gsk_key_that_fails"}):
        res = advisor.generate_advice(
            financial={
                "indicative_project_cost": 400000.0,
                "available_margin_capital": 40000.0,
                "financing_requirement": 360000.0,
                "margin_pct": 10.0,
                "has_margin_shortfall": False,
            },
            opportunity={"overall_opportunity_score": 55.0, "market_reach": "Moderate"},
        )

    assert isinstance(res, AdvisorResponse)
    assert "400,000.00" in res.summary
    assert res.traceability.provenance_priority == "DETERMINISTIC_SYNTHESIS"
    assert "VITTANAYA Deterministic AI Advisor Engine" in res.traceability.source_authority
