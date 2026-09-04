"""Local Offline NLP Intent Classifier for VITTANAYA (SIH26091).

Implements pure Scikit-Learn TF-IDF vectorization and Logistic Regression classification
trained on local micro-enterprise domain queries. 100% offline, zero external LLM dependency,
and sub-2ms inference latency.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Path definitions
CURRENT_DIR = Path(__file__).resolve().parent
MODELS_DIR = CURRENT_DIR / "models"
DATASET_FILE = CURRENT_DIR / "intent_dataset.json"
MODEL_PATH = MODELS_DIR / "intent_classifier.joblib"
VECTORIZER_PATH = MODELS_DIR / "tfidf_vectorizer.joblib"

# Common conversational stopwords that blur micro-enterprise intent distinction
CUSTOM_STOP_WORDS = [
    "what", "is", "my", "the", "how", "much", "can", "i", "do",
    "we", "are", "tell", "me", "about", "a", "an", "for", "this",
    "please", "give", "show", "in", "to", "of", "and",
]

CONFIDENCE_THRESHOLD = 0.25


class LocalIntentClassifier:
    """Offline Scikit-Learn TF-IDF + Logistic Regression Intent Classifier."""

    _instance = None
    _vectorizer: Optional[TfidfVectorizer] = None
    _classifier: Optional[LogisticRegression] = None
    _classes: List[str] = []

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LocalIntentClassifier, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Load pre-trained models from disk, or train from dataset on first run."""
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        if MODEL_PATH.exists() and VECTORIZER_PATH.exists():
            try:
                self._classifier = joblib.load(MODEL_PATH)
                self._vectorizer = joblib.load(VECTORIZER_PATH)
                self._classes = [str(c) for c in self._classifier.classes_]
                return
            except Exception:
                pass

        # Train from local dataset
        self.train()

    def train(self) -> Dict[str, float]:
        """Train TF-IDF + Logistic Regression classifier on intent_dataset.json."""
        if not DATASET_FILE.exists():
            raise FileNotFoundError(f"Intent dataset file not found at {DATASET_FILE}")

        with open(DATASET_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        texts: List[str] = []
        labels: List[str] = []

        for intent, questions in data.items():
            for q in questions:
                clean_q = self._preprocess(q)
                if clean_q:
                    texts.append(clean_q)
                    labels.append(intent)

        if not texts:
            raise ValueError("Training dataset is empty")

        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words=CUSTOM_STOP_WORDS,
            strip_accents="unicode",
        )
        X = vectorizer.fit_transform(texts)

        clf = LogisticRegression(
            C=5.0,
            max_iter=400,
            solver="lbfgs",
            random_state=42,
        )
        clf.fit(X, labels)

        # Save artifacts
        joblib.dump(clf, MODEL_PATH)
        joblib.dump(vectorizer, VECTORIZER_PATH)

        self._classifier = clf
        self._vectorizer = vectorizer
        self._classes = [str(c) for c in clf.classes_]

        train_acc = float(clf.score(X, labels))
        return {
            "samples": len(texts),
            "intents": len(self._classes),
            "train_accuracy": round(train_acc, 4),
        }

    @staticmethod
    def _preprocess(text: str) -> str:
        """Clean and normalize input text for vectorization."""
        if not text:
            return ""
        t = text.lower().strip()
        t = re.sub(r"[^\w\s\-\%]", " ", t)
        t = re.sub(r"\s+", " ", t).strip()
        return t

    def classify(self, query: str) -> Tuple[str, float, str]:
        """Classify user query returning (intent, confidence, method)."""
        clean_text = self._preprocess(query)
        if not clean_text:
            return "GENERAL", 1.0, "DEFAULT"

        # 1. Scikit-Learn ML Inference
        if self._classifier is not None and self._vectorizer is not None:
            try:
                X = self._vectorizer.transform([clean_text])
                probs = self._classifier.predict_proba(X)[0]
                max_idx = int(probs.argmax())
                best_intent = str(self._classes[max_idx])
                confidence = float(probs[max_idx])

                if confidence >= CONFIDENCE_THRESHOLD:
                    return best_intent, round(confidence, 4), "TF_IDF_LOGISTIC_REGRESSION"
            except Exception:
                pass

        # 2. Fallback to deterministic regex/rule classification
        rule_intent = self._rule_fallback(clean_text)
        return rule_intent, 0.75, "DETERMINISTIC_RULES"

    @staticmethod
    def _rule_fallback(lower_msg: str) -> str:
        """Deterministic keyword safety fallback."""
        if any(w in lower_msg for w in ["business name", "my business", "my enterprise", "company name", "firm name"]):
            return "PROFILE_IDENTITY"
        if any(w in lower_msg for w in ["monthly revenue", "sales revenue", "my revenue", "monthly sales", "monthly expense", "my expense", "operating cost"]):
            return "REVENUE_EXPENSE"
        if any(w in lower_msg for w in ["emi", "loan", "borrow", "financing", "tenure", "interest", "repay", "promoter capital", "margin money"]):
            return "FINANCIAL"
        if any(w in lower_msg for w in ["cash", "liquidity", "runway", "cash buffer", "working capital", "shortage"]):
            return "CASH_FLOW"
        if any(w in lower_msg for w in ["feasible", "feasibility", "demand", "market", "viable", "catchment"]):
            return "FEASIBILITY"
        if any(w in lower_msg for w in ["risk", "threat", "hazard", "danger", "seasonality", "vulnerability"]):
            return "RISK"
        if any(w in lower_msg for w in ["what if", "what-if", "sales fall", "sales drop", "costs rise", "stress test"]):
            return "WHAT_IF"
        if any(w in lower_msg for w in ["scheme", "pmegp", "pm-fme", "mudra", "subsidy", "grant"]):
            return "SCHEME"
        if any(w in lower_msg for w in ["break even", "scrap", "capacity util", "food cost", "seat turnover"]):
            return "INDUSTRY"
        if any(w in lower_msg for w in ["ml", "predictive", "default risk", "distress", "growth forecast", "gini", "feature importance"]):
            return "PREDICTIVE_ML"
        if any(w in lower_msg for w in ["action", "step", "roadmap", "dpr", "milestone", "apply", "register"]):
            return "ACTION"
        if any(w in lower_msg for w in ["why", "explain", "how did you", "reason for", "justify"]):
            return "EXPLANATION"
        return "GENERAL"


_classifier_instance = None


def get_intent_classifier() -> LocalIntentClassifier:
    """Get or initialize singleton intent classifier."""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = LocalIntentClassifier()
    return _classifier_instance


def classify_intent(query: str) -> Tuple[str, float, str]:
    """Convenience functional API for intent classification."""
    return get_intent_classifier().classify(query)
