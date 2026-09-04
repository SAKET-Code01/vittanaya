"""Test suite for Local Offline NLP Intent Classifier (TF-IDF + Logistic Regression)."""

import pytest

from backend.app.nlp.intent_classifier import classify_intent, get_intent_classifier


def test_classifier_initialization():
    """Verify that the singleton classifier initializes and reports 100% offline capability."""
    clf = get_intent_classifier()
    assert clf is not None
    assert clf._classifier is not None
    assert clf._vectorizer is not None
    assert len(clf._classes) >= 11


@pytest.mark.parametrize(
    "query,expected_intent",
    [
        ("What is my EMI?", "FINANCIAL"),
        ("How much monthly loan installment do I have to pay?", "FINANCIAL"),
        ("Will I have enough cash next month?", "CASH_FLOW"),
        ("Will my business run out of money during monsoon?", "CASH_FLOW"),
        ("Is my business feasible?", "FEASIBILITY"),
        ("What is my feasibility score?", "FEASIBILITY"),
        ("What is my biggest risk?", "RISK"),
        ("What threats does my enterprise face?", "RISK"),
        ("What happens if sales fall 15%?", "WHAT_IF"),
        ("Simulate a drop in demand and higher costs", "WHAT_IF"),
        ("Which government scheme is best for me?", "SCHEME"),
        ("Am I eligible for PMEGP subsidy?", "SCHEME"),
        ("What is my contribution margin ratio?", "INDUSTRY"),
        ("What is my break-even volume?", "INDUSTRY"),
        ("What does the predictive model say?", "PREDICTIVE_ML"),
        ("What is my predicted default risk probability?", "PREDICTIVE_ML"),
        ("What should I do next?", "ACTION"),
        ("Give me an action plan to start my business", "ACTION"),
        ("Why is my feasibility score 78?", "EXPLANATION"),
        ("Explain the formula behind my score", "EXPLANATION"),
        ("What is my business name?", "PROFILE_IDENTITY"),
        ("What is my monthly revenue?", "REVENUE_EXPENSE"),
        ("Hello VITTANAYA", "GENERAL"),
    ],
)
def test_intent_classification_accuracy(query, expected_intent):
    """Verify high-accuracy intent classification across representative queries."""
    intent, confidence, method = classify_intent(query)
    assert intent == expected_intent, f"Query '{query}' expected '{expected_intent}' but got '{intent}' ({confidence:.1%})"
    assert confidence > 0.20
    assert method in ["TF_IDF_LOGISTIC_REGRESSION", "EXACT_RULE", "DETERMINISTIC_RULES"]


def test_inference_latency():
    """Verify sub-10ms offline inference latency on local CPU."""
    import time

    start = time.perf_counter()
    for _ in range(50):
        classify_intent("Can I get a loan subsidy under PMEGP?")
    duration = time.perf_counter() - start
    avg_latency_ms = (duration / 50) * 1000.0

    assert avg_latency_ms < 10.0, f"Average latency was {avg_latency_ms:.2f}ms, expected < 10ms"
