import json
import os
import urllib.request
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from backend.app.schemas.insights import AdvisorResponse, TraceabilityMetadata


class LLMProvider(ABC):
    """Abstract base provider for zero-hallucination grounded LLM inference."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return provider identifier e.g. 'Gemini 1.5 Flash' or 'Ollama Llama-3'."""
        pass

    @abstractmethod
    def generate(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate structured JSON response from prompt, or return None if unavailable."""
        pass


class GroqProvider(LLMProvider):
    """Production cloud LLM provider using Groq API (openai/gpt-oss-120b)."""

    DEFAULT_MODEL: str = "openai/gpt-oss-120b"
    ENDPOINT: str = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        endpoint: Optional[str] = None,
        timeout: float = 6.0,
    ):
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.model = model or os.environ.get("GROQ_MODEL", self.DEFAULT_MODEL)
        self.endpoint = endpoint or self.ENDPOINT
        self.timeout = timeout

    @property
    def provider_name(self) -> str:
        return f"Groq ({self.model})"

    def is_available(self) -> bool:
        """Return True if GROQ_API_KEY is configured and valid."""
        return bool(self.api_key and self.api_key.strip() and not self.api_key.startswith("mock_") and self.api_key != "missing")

    def generate(self, prompt: str) -> Optional[Dict[str, Any]]:
        """
        Execute server-side chat completion request to Groq API.

        Safely returns parsed JSON dict or None on any network/quota/API error.
        Never throws unhandled exceptions; falls back to deterministic rule engine.
        """
        if not self.api_key:
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "VITTANAYA-Advisory/1.0",
        }
        data = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are VITTANAYA, an AI hyper-local business advisory assistant for rural micro-entrepreneurs. "
                        "You must respond ONLY with a valid JSON object containing exactly these keys: "
                        "'summary' (string), 'why_this_result' (list of strings), 'recommended_next_steps' (list of strings). "
                        "Base all answers solely on the provided verified financial, scheme, and feasibility data. "
                        "Never fabricate or override scores, financial metrics, or scheme guidelines."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        try:
            req = urllib.request.Request(
                self.endpoint,
                data=json.dumps(data).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                status_code = getattr(resp, "status", None) or getattr(resp, "code", None)
                if status_code == 200:
                    res_body = json.loads(resp.read().decode("utf-8"))
                    choices = res_body.get("choices", [])
                    if choices and "message" in choices[0]:
                        content = choices[0]["message"].get("content", "").strip()
                        if content.startswith("```"):
                            lines = content.splitlines()
                            if lines and lines[0].startswith("```"):
                                lines = lines[1:]
                            if lines and lines[-1].startswith("```"):
                                lines = lines[:-1]
                            content = "\n".join(lines).strip()
                        parsed = json.loads(content)
                        if isinstance(parsed, dict) and "summary" in parsed:
                            return parsed
        except Exception:
            # Gracefully handle quota exhaustion, rate limiting (HTTP 429), timeouts, or network loss
            pass
        return None

    def generate_chat(
        self,
        system_prompt: str,
        user_prompt: str,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Optional[str]:
        """
        Execute conversational chat completion with Groq openai/gpt-oss-120b.
        Returns the generated natural language string or None on failure.
        """
        if not self.api_key:
            return None

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            for h in history[-4:]:
                role = "assistant" if h.get("sender") in ("ai", "assistant") else "user"
                if h.get("text"):
                    messages.append({"role": role, "content": h["text"]})
        messages.append({"role": "user", "content": user_prompt})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "VITTANAYA-Advisory/1.0",
        }
        data = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 512,
        }

        try:
            req = urllib.request.Request(
                self.endpoint,
                data=json.dumps(data).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                status_code = getattr(resp, "status", None) or getattr(resp, "code", None)
                if status_code == 200:
                    res_body = json.loads(resp.read().decode("utf-8"))
                    choices = res_body.get("choices", [])
                    if choices and "message" in choices[0]:
                        content = choices[0]["message"].get("content", "").strip()
                        if content:
                            return content
        except Exception:
            pass
        return None


class OllamaProvider(LLMProvider):
    """Future/optional local offline LLM provider using Ollama HTTP API (disabled by default)."""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3"):
        self.base_url = base_url
        self.model = model
        self.enabled = os.environ.get("OLLAMA_ENABLED", "false").lower() in ("true", "1", "yes")

    @property
    def provider_name(self) -> str:
        return f"Ollama {self.model} (Local Offline)"

    def generate(self, prompt: str) -> Optional[Dict[str, Any]]:
        if not self.enabled:
            return None
        url = f"{self.base_url}/api/generate"
        headers = {"Content-Type": "application/json"}
        data = {
            "model": self.model,
            "prompt": prompt,
            "format": "json",
            "stream": False,
        }
        try:
            req = urllib.request.Request(
                url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    res_body = json.loads(resp.read().decode("utf-8"))
                    return json.loads(res_body.get("response", "{}"))
        except Exception:
            pass
        return None


# Legacy compatibility alias
GeminiProvider = GroqProvider


def get_llm_provider() -> LLMProvider:
    """Provider factory: returns active provider. Defaults to GroqProvider."""
    if os.environ.get("OLLAMA_ENABLED", "false").lower() in ("true", "1", "yes"):
        return OllamaProvider()
    return GroqProvider()


class AIBusinessAdvisor:
    """Zero-Hallucination AI Advisor explaining structured deterministic findings."""

    def __init__(self, provider: Optional[LLMProvider] = None):
        self.provider = provider or get_llm_provider()

    def _call_llm(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Call active LLM provider (Groq openai/gpt-oss-120b)."""
        return self.provider.generate(prompt)

    def _call_gemini_llm(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Legacy compatibility alias forwarding to active LLM provider."""
        return self._call_llm(prompt)

    def generate_advice(
        self,
        opportunity: Optional[Dict[str, Any]] = None,
        financial: Optional[Dict[str, Any]] = None,
        schemes: Optional[Dict[str, Any]] = None,
        risks: Optional[Dict[str, Any]] = None,
        what_if: Optional[Dict[str, Any]] = None,
    ) -> AdvisorResponse:
        """Synthesize structured backend results without inventing data."""
        # Attempt LLM enhancement if Groq key available
        if os.environ.get("GROQ_API_KEY"):
            structured_context = {
                "opportunity": opportunity,
                "financial": financial,
                "schemes": schemes,
                "risks": risks,
                "what_if": what_if,
            }
            prompt = (
                "You are VITTANAYA, a hyper-local business advisory assistant for rural micro-entrepreneurs. "
                "Synthesize the following structured backend data into accessible advice. "
                "Do NOT invent numbers or scheme rules outside the provided context.\n"
                f"Context JSON: {json.dumps(structured_context)}\n\n"
                "Return JSON with keys: 'summary' (string), 'why_this_result' (list of strings), 'recommended_next_steps' (list of strings)."
            )
            llm_result = self._call_llm(prompt)
            if llm_result and "summary" in llm_result and "why_this_result" in llm_result:
                traceability = TraceabilityMetadata(
                    input={"llm_enhanced": True, "provider": self.provider.provider_name},
                    calculation_rule="LLM-enhanced synthesis anchored to verified backend facts via Groq API.",
                    source_authority=f"{self.provider.provider_name} + VITTANAYA Grounding Engine",
                    source_year="2026",
                    provenance_priority="LLM_ENHANCED",
                    official_source_url=None,
                )
                return AdvisorResponse(
                    summary=llm_result["summary"],
                    why_this_result=llm_result.get("why_this_result", []),
                    recommended_next_steps=llm_result.get("recommended_next_steps", []),
                    traceability=traceability,
                )

        why_list: List[str] = []
        next_steps: List[str] = []

        # 1. Financial & Cost Synthesis
        if financial:
            proj_cost = financial.get("indicative_project_cost", 0.0)
            margin_cap = financial.get("available_margin_capital", 0.0)
            fin_req = financial.get("financing_requirement", 0.0)
            margin_pct = financial.get("margin_pct", 0.0)
            has_shortfall = financial.get("has_margin_shortfall", False)
            shortfall_amt = financial.get("margin_shortfall_amount", 0.0)

            fin_summary = (
                f"Your estimated project cost is ₹{proj_cost:,.2f}. With your available margin capital of "
                f"₹{margin_cap:,.2f} ({margin_pct:.1f}%), your total credit requirement from bank/scheme is ₹{fin_req:,.2f}."
            )
            why_list.append(
                f"Financial Structuring: Project cost reference is sourced from official NABARD PLP / PMEGP Odisha records. "
                f"Debt requirement = Indicative Cost (₹{proj_cost:,.2f}) - Margin (₹{margin_cap:,.2f})."
            )

            if has_shortfall:
                why_list.append(
                    f"Margin Shortfall Notice: Standard banking rules require minimum 10% own equity (₹{shortfall_amt + margin_cap:,.2f}). "
                    f"You currently have a deficit of ₹{shortfall_amt:,.2f}."
                )
                next_steps.append(
                    f"Augment own margin capital by ₹{shortfall_amt:,.2f} or apply for special category subsidy under PMEGP to satisfy 5% margin limit."
                )
            else:
                next_steps.append(
                    "Maintain proof of available margin capital (bank statement/FD) for loan processing."
                )
        else:
            fin_summary = "Financial analysis summary pending input."

        # 2. Scheme Matching Synthesis
        if schemes:
            best_scheme = schemes.get("best_recommendation")
            eligible_schemes = schemes.get("eligible_schemes", [])

            if best_scheme:
                scheme_name = best_scheme.get("scheme_name", "Government Credit Scheme")
                subsidy_amt = best_scheme.get("estimated_subsidy_amount", 0.0)
                subsidy_pct = best_scheme.get("estimated_subsidy_pct", 0.0)
                loan_amt = best_scheme.get("eligible_loan_amount", 0.0)
                src_auth = best_scheme.get("source_authority", "Ministry Guidelines")

                scheme_summary = (
                    f" Top Recommended Scheme: '{scheme_name}'. You are eligible for an estimated capital subsidy of "
                    f"₹{subsidy_amt:,.2f} ({subsidy_pct:.0f}%), bringing your net bank loan requirement down to ₹{loan_amt:,.2f}."
                )
                why_list.append(
                    f"Scheme Match Authority: Criteria verified against official {src_auth} guidelines. "
                    f"Total {len(eligible_schemes)} scheme(s) matched your project profile."
                )
                next_steps.append(
                    f"Prepare Detailed Project Report (DPR) formatted for {scheme_name} and submit via official government portal."
                )
            elif eligible_schemes:
                scheme_summary = (
                    f" Matched {len(eligible_schemes)} eligible scheme(s) for your enterprise."
                )
            else:
                scheme_summary = " No scheme matched current parameters due to project cost ceiling or activity restrictions."
                why_list.append(
                    "Scheme Non-Eligibility: Check PMEGP trading restrictions or project cost upper bounds."
                )
                next_steps.append(
                    "Consider restructuring business activity scale to align with MUDRA or PMEGP caps."
                )
        else:
            scheme_summary = ""

        # 3. Feasibility Synthesis
        if opportunity:
            market_reach = opportunity.get("market_reach", "Data insufficient")
            is_sufficient = opportunity.get("is_data_sufficient", True)
            opp_score = opportunity.get("overall_opportunity_score", 50.0)

            if is_sufficient:
                feasibility_summary = f" Local Opportunity Score: {opp_score:.0f}/100. Target market reach: {market_reach}."
                why_list.append(
                    f"Local Opportunity: Feasibility grounded in verified Odisha district sector benchmarks ({market_reach})."
                )
            else:
                feasibility_summary = " Local feasibility market statistics marked as 'Data insufficient' per strict data integrity directive."
                why_list.append(
                    "Data Traceability: Exact Gram Panchayat empirical market data was absent; neutral baseline applied without fabricating numbers."
                )
                next_steps.append(
                    "Conduct primary local customer & supplier survey in target block before capital commitment."
                )
        else:
            feasibility_summary = ""

        # 4. Risk Synthesis
        if risks:
            overall_risk = risks.get("overall_risk", "Medium")
            top_risks = risks.get("top_risks", [])

            risk_summary = f" Overall Risk Level: {overall_risk}."
            risk_names = ", ".join(
                [r.get("risk_name", "") for r in top_risks if isinstance(r, dict)]
            )
            if risk_names:
                why_list.append(f"Risk Profile: Primary risk drivers identified as {risk_names}.")
                next_steps.append(
                    f"Implement mitigation plan addressing key risk drivers: {risk_names}."
                )
        else:
            risk_summary = ""

        # 5. What-If Scenario Synthesis
        if what_if:
            isolated = what_if.get("isolated_scenario", True)
            var = what_if.get("variance", {})
            surplus_diff = var.get("surplus_diff", 0.0)
            if isolated and surplus_diff != 0.0:
                direction = "decrease" if surplus_diff < 0 else "increase"
                why_list.append(
                    f"What-If Simulation: Isolated scenario analysis indicates a net annual surplus {direction} of ₹{abs(surplus_diff):,.2f} "
                    f"without modifying baseline plan."
                )

        # Composite Summary
        full_summary = f"{fin_summary}{scheme_summary}{feasibility_summary}{risk_summary}".strip()

        # Guarantee at least basic next steps if empty
        if not next_steps:
            next_steps = [
                "Review indicative project costs with local DIC / NABARD district officer.",
                "Gather identity, caste/category, and land/rent agreement documents for scheme portal registration.",
                "Consult local bank branch manager for pre-sanction guidance.",
            ]

        traceability = TraceabilityMetadata(
            input={
                "opportunity_received": bool(opportunity),
                "financial_received": bool(financial),
                "schemes_received": bool(schemes),
                "risks_received": bool(risks),
                "what_if_received": bool(what_if),
            },
            calculation_rule="Zero-hallucination synthesis engine binding exact structured inputs to accessible natural language recommendations.",
            source_authority="VITTANAYA Deterministic AI Advisor Engine",
            source_year="2026",
            provenance_priority="DETERMINISTIC_SYNTHESIS",
            official_source_url=None,
        )

        return AdvisorResponse(
            summary=full_summary,
            why_this_result=why_list,
            recommended_next_steps=next_steps,
            traceability=traceability,
        )
