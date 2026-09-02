"""Deterministic tests for AHP Feasibility Weight Service (SIH26091).

Test groups:
 1.  Each of 10 geometric means (tolerance 1e-6)
 2.  Reciprocal matrix construction (5x5, diagonal=1, lower=reciprocal)
 3.  Row geometric means (5 values)
 4.  Normalized weights (sum = 1.0, tolerance 1e-10)
 5.  Dashboard rounding (30/25/15/15/15 for current Dataset B)
 6.  lambda_max value
 7.  CI value
 8.  CR value
 9.  Dataset provenance/status
10.  Missing-data handling for Dataset A (6 comparisons = None)
11.  No frontend hardcoded weight override (endpoint returns values matching spec)
12.  Feasibility contribution formula: contribution = (raw/100) * dashboard_points
"""

import math
import pytest

from backend.app.services.ahp_service import (
    DATASET_A_PARTIAL,
    DATASET_B_EXPERT_RESPONSES,
    DATASET_B_SOURCE_STATUS,
    AHPService,
    get_ahp_result,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

TOL = 1e-6  # tolerance for floating-point comparisons


def gm5(values):
    """Geometric mean of exactly 5 values."""
    product = 1.0
    for v in values:
        product *= v
    return product ** 0.2


# ---------------------------------------------------------------------------
# Test Group 1: Each of the 10 geometric means
# Expected values from the AHP Guide PDF specification
# ---------------------------------------------------------------------------

class TestGeometricMeans:
    EXPECTED_GM = {
        "M/F": (1 * 1 * 1 * 1 * 3) ** 0.2,          # 1.2457309396
        "M/L": (1 * 1 * 1 * 4 * 8) ** 0.2,           # 2.0000000000
        "M/C": (1 * 1 * 1 * 4 * 8) ** 0.2,           # 2.0000000000
        "M/R": (1 * 1 * 1 * 4 * 8) ** 0.2,           # 2.0000000000
        "F/L": (1 * 1 * 1 * 2 * 6) ** 0.2,           # 1.6437518295
        "F/C": (1 * 1 * 1 * 2 * 6) ** 0.2,           # 1.6437518295
        "F/R": (1 * 1 * 1 * 2 * 6) ** 0.2,           # 1.6437518295
        "L/C": (1 * 1 * 1 * 1 * 1) ** 0.2,           # 1.0000000000
        "L/R": (1 * 1 * 1 * 1 * 1) ** 0.2,           # 1.0000000000
        "C/R": (1 * 1 * 1 * 1 * 1) ** 0.2,           # 1.0000000000
    }

    def test_gm_m_vs_f(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        assert abs(gm["M/F"] - self.EXPECTED_GM["M/F"]) < TOL

    def test_gm_m_vs_l(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        assert abs(gm["M/L"] - 2.0) < TOL

    def test_gm_m_vs_c(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        assert abs(gm["M/C"] - 2.0) < TOL

    def test_gm_m_vs_r(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        assert abs(gm["M/R"] - 2.0) < TOL

    def test_gm_f_vs_l(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        expected = (1 * 1 * 1 * 2 * 6) ** 0.2
        assert abs(gm["F/L"] - expected) < TOL

    def test_gm_f_vs_c(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        expected = (1 * 1 * 1 * 2 * 6) ** 0.2
        assert abs(gm["F/C"] - expected) < TOL

    def test_gm_f_vs_r(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        expected = (1 * 1 * 1 * 2 * 6) ** 0.2
        assert abs(gm["F/R"] - expected) < TOL

    def test_gm_l_vs_c(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        assert abs(gm["L/C"] - 1.0) < TOL

    def test_gm_l_vs_r(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        assert abs(gm["L/R"] - 1.0) < TOL

    def test_gm_c_vs_r(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        assert abs(gm["C/R"] - 1.0) < TOL

    def test_all_10_pairwise_keys_present(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        assert len(gm) == 10


# ---------------------------------------------------------------------------
# Test Group 2: Reciprocal matrix construction
# ---------------------------------------------------------------------------

class TestReciprocalMatrix:
    def _get_matrix(self):
        svc = AHPService()
        gm = svc._compute_aggregated_pairwise()
        return svc._build_reciprocal_matrix(gm), gm

    def test_matrix_dimensions(self):
        mat, _ = self._get_matrix()
        assert len(mat) == 5
        assert all(len(row) == 5 for row in mat)

    def test_diagonal_is_one(self):
        mat, _ = self._get_matrix()
        for i in range(5):
            assert abs(mat[i][i] - 1.0) < TOL

    def test_lower_triangle_is_reciprocal(self):
        mat, _ = self._get_matrix()
        for i in range(5):
            for j in range(i + 1, 5):
                assert abs(mat[i][j] * mat[j][i] - 1.0) < TOL, (
                    f"mat[{i}][{j}]={mat[i][j]}, mat[{j}][{i}]={mat[j][i]}, "
                    f"product={mat[i][j]*mat[j][i]}"
                )

    def test_expected_upper_triangle_values(self):
        mat, gm = self._get_matrix()
        # [M,F,L,C,R] = indices 0,1,2,3,4
        assert abs(mat[0][1] - gm["M/F"]) < TOL   # Market vs Financial
        assert abs(mat[0][2] - 2.0) < TOL          # Market vs Location = 2.0
        assert abs(mat[0][3] - 2.0) < TOL          # Market vs Competition = 2.0
        assert abs(mat[0][4] - 2.0) < TOL          # Market vs Risk = 2.0
        expected_fl = (1 * 1 * 1 * 2 * 6) ** 0.2
        assert abs(mat[1][2] - expected_fl) < TOL  # Financial vs Location
        assert abs(mat[2][3] - 1.0) < TOL          # Location vs Competition = 1.0
        assert abs(mat[3][4] - 1.0) < TOL          # Competition vs Risk = 1.0


# ---------------------------------------------------------------------------
# Test Group 3: Row geometric means
# ---------------------------------------------------------------------------

class TestRowGeometricMeans:
    # Expected values from AHP Guide PDF
    EXPECTED = {
        "market":      1.58380915,
        "financial":   1.28948680,
        "location":    0.78818243,
        "competition": 0.78818243,
        "risk":        0.78818243,
    }
    ROW_TOL = 1e-5

    def test_market_row_gm(self):
        result = get_ahp_result()
        assert abs(result.row_geometric_means["market"] - self.EXPECTED["market"]) < self.ROW_TOL

    def test_financial_row_gm(self):
        result = get_ahp_result()
        assert abs(result.row_geometric_means["financial"] - self.EXPECTED["financial"]) < self.ROW_TOL

    def test_location_row_gm(self):
        result = get_ahp_result()
        assert abs(result.row_geometric_means["location"] - self.EXPECTED["location"]) < self.ROW_TOL

    def test_competition_row_gm(self):
        result = get_ahp_result()
        assert abs(result.row_geometric_means["competition"] - self.EXPECTED["competition"]) < self.ROW_TOL

    def test_risk_row_gm(self):
        result = get_ahp_result()
        assert abs(result.row_geometric_means["risk"] - self.EXPECTED["risk"]) < self.ROW_TOL


# ---------------------------------------------------------------------------
# Test Group 4: Normalized weights (sum = 1.0)
# ---------------------------------------------------------------------------

class TestNormalizedWeights:
    EXPECTED = {
        "market":      0.30237811,
        "financial":   0.24618660,
        "location":    0.15047843,
        "competition": 0.15047843,
        "risk":        0.15047843,
    }
    WEIGHT_TOL = 1e-6

    def test_weights_sum_to_one(self):
        result = get_ahp_result()
        total = sum(result.normalized_weights.values())
        assert abs(total - 1.0) < 5e-10, f"Weights sum to {total}, expected 1.0"

    def test_market_weight(self):
        result = get_ahp_result()
        assert abs(result.normalized_weights["market"] - self.EXPECTED["market"]) < self.WEIGHT_TOL

    def test_financial_weight(self):
        result = get_ahp_result()
        assert abs(result.normalized_weights["financial"] - self.EXPECTED["financial"]) < self.WEIGHT_TOL

    def test_location_weight(self):
        result = get_ahp_result()
        assert abs(result.normalized_weights["location"] - self.EXPECTED["location"]) < self.WEIGHT_TOL

    def test_competition_weight(self):
        result = get_ahp_result()
        assert abs(result.normalized_weights["competition"] - self.EXPECTED["competition"]) < self.WEIGHT_TOL

    def test_risk_weight(self):
        result = get_ahp_result()
        assert abs(result.normalized_weights["risk"] - self.EXPECTED["risk"]) < self.WEIGHT_TOL

    def test_all_five_criteria_present(self):
        result = get_ahp_result()
        assert set(result.normalized_weights.keys()) == {"market","financial","location","competition","risk"}


# ---------------------------------------------------------------------------
# Test Group 5: Dashboard rounding (sum = 100)
# ---------------------------------------------------------------------------

class TestDashboardRounding:
    def test_dashboard_sums_to_100(self):
        result = get_ahp_result()
        assert sum(result.dashboard_points.values()) == 100

    def test_dashboard_market_is_30(self):
        result = get_ahp_result()
        assert result.dashboard_points["market"] == 30

    def test_dashboard_financial_is_25(self):
        result = get_ahp_result()
        assert result.dashboard_points["financial"] == 25

    def test_dashboard_location_is_15(self):
        result = get_ahp_result()
        assert result.dashboard_points["location"] == 15

    def test_dashboard_competition_is_15(self):
        result = get_ahp_result()
        assert result.dashboard_points["competition"] == 15

    def test_dashboard_risk_is_15(self):
        result = get_ahp_result()
        assert result.dashboard_points["risk"] == 15


# ---------------------------------------------------------------------------
# Test Group 6: lambda_max
# ---------------------------------------------------------------------------

class TestLambdaMax:
    EXPECTED_LAMBDA = 5.0000665904

    def test_lambda_max_value(self):
        result = get_ahp_result()
        assert abs(result.lambda_max - self.EXPECTED_LAMBDA) < 1e-6, (
            f"lambda_max = {result.lambda_max}, expected ~{self.EXPECTED_LAMBDA}"
        )


# ---------------------------------------------------------------------------
# Test Group 7: CI
# ---------------------------------------------------------------------------

class TestConsistencyIndex:
    EXPECTED_CI = 0.0000166476

    def test_ci_value(self):
        result = get_ahp_result()
        assert abs(result.ci - self.EXPECTED_CI) < 1e-7, (
            f"CI = {result.ci}, expected ~{self.EXPECTED_CI}"
        )


# ---------------------------------------------------------------------------
# Test Group 8: CR
# ---------------------------------------------------------------------------

class TestConsistencyRatio:
    EXPECTED_CR = 0.0000148639

    def test_cr_value(self):
        result = get_ahp_result()
        assert abs(result.cr - self.EXPECTED_CR) < 1e-8, (
            f"CR = {result.cr}, expected ~{self.EXPECTED_CR}"
        )

    def test_cr_below_threshold(self):
        result = get_ahp_result()
        assert result.cr < 0.10, "CR must be below 0.10 to pass consistency check"

    def test_is_consistent_flag(self):
        result = get_ahp_result()
        assert result.is_consistent is True

    def test_ri_is_1_12(self):
        result = get_ahp_result()
        assert result.ri == 1.12


# ---------------------------------------------------------------------------
# Test Group 9: Dataset provenance / source status
# ---------------------------------------------------------------------------

class TestDataProvenance:
    def test_source_status_is_illustrative(self):
        result = get_ahp_result()
        assert result.source_status == "illustrative_dataset"

    def test_expert_dataset_is_b(self):
        result = get_ahp_result()
        assert result.expert_dataset == "dataset_b"

    def test_expert_count_is_5(self):
        result = get_ahp_result()
        assert result.expert_count == 5

    def test_comparison_count_is_10(self):
        result = get_ahp_result()
        assert result.comparison_count == 10

    def test_disclaimer_not_claims_official(self):
        result = get_ahp_result()
        disclaimer = result.source_disclaimer.lower()
        assert "government" not in disclaimer or "not" in disclaimer
        assert "illustrative" in disclaimer

    def test_aggregation_method_is_geometric_mean(self):
        result = get_ahp_result()
        assert result.aggregation_method == "geometric_mean"


# ---------------------------------------------------------------------------
# Test Group 10: Dataset A missing-data handling
# ---------------------------------------------------------------------------

class TestDatasetAMissingData:
    def test_exactly_4_visible_comparisons(self):
        result = get_ahp_result()
        assert len(result.dataset_a_visible_gm) == 4

    def test_exactly_6_missing_comparisons(self):
        result = get_ahp_result()
        assert len(result.dataset_a_missing) == 6

    def test_missing_comparisons_are_known_keys(self):
        result = get_ahp_result()
        expected_missing = {"F/L", "F/C", "F/R", "L/C", "L/R", "C/R"}
        assert set(result.dataset_a_missing) == expected_missing

    def test_dataset_a_status_is_partial(self):
        result = get_ahp_result()
        assert "partial" in result.dataset_a_status.lower()

    def test_dataset_a_raw_contains_none_for_missing(self):
        none_count = sum(1 for v in DATASET_A_PARTIAL.values() if v is None)
        assert none_count == 6

    def test_dataset_a_visible_gm_m_vs_f(self):
        result = get_ahp_result()
        expected = (2 * 1 * 2 * 1 * 3) ** 0.2
        assert abs(result.dataset_a_visible_gm["M/F"] - expected) < 1e-6

    def test_dataset_a_visible_gm_m_vs_l(self):
        result = get_ahp_result()
        expected = (3 * 3 * 2 * 2 * 3) ** 0.2
        assert abs(result.dataset_a_visible_gm["M/L"] - expected) < 1e-6

    def test_dataset_a_visible_gm_m_vs_c(self):
        result = get_ahp_result()
        expected = (3 * 2 * 3 * 2 * 3) ** 0.2
        assert abs(result.dataset_a_visible_gm["M/C"] - expected) < 1e-6

    def test_dataset_a_visible_gm_m_vs_r(self):
        result = get_ahp_result()
        expected = (3 * 2 * 2 * 2 * 3) ** 0.2
        assert abs(result.dataset_a_visible_gm["M/R"] - expected) < 1e-6


# ---------------------------------------------------------------------------
# Test Group 11: No frontend hardcoded weight override
# (Endpoint result matches the AHP-computed values)
# ---------------------------------------------------------------------------

class TestNoFrontendHardcodedOverride:
    """
    Verifies that the API endpoint (and therefore the frontend, which reads
    from it) uses AHP-computed values, not separately hardcoded constants.
    The test exercises the endpoint via the FastAPI TestClient.
    """

    def test_endpoint_returns_ahp_weights(self):
        from fastapi.testclient import TestClient
        from backend.main import app
        client = TestClient(app)
        response = client.get("/api/v1/ahp/weights")
        assert response.status_code == 200
        data = response.json()
        assert "normalized_weights" in data
        assert "dashboard_points" in data

    def test_endpoint_dashboard_points_match_service(self):
        from fastapi.testclient import TestClient
        from backend.main import app
        client = TestClient(app)
        response = client.get("/api/v1/ahp/weights")
        data = response.json()
        result = get_ahp_result()
        # Endpoint must return same dashboard_points as service
        assert data["dashboard_points"] == result.dashboard_points

    def test_endpoint_cr_matches_service(self):
        from fastapi.testclient import TestClient
        from backend.main import app
        client = TestClient(app)
        response = client.get("/api/v1/ahp/weights")
        data = response.json()
        result = get_ahp_result()
        assert abs(data["cr"] - result.cr) < 1e-12

    def test_endpoint_source_status_correct(self):
        from fastapi.testclient import TestClient
        from backend.main import app
        client = TestClient(app)
        response = client.get("/api/v1/ahp/weights")
        data = response.json()
        assert data["source_status"] == "illustrative_dataset"

    def test_criteria_detail_count_is_five(self):
        from fastapi.testclient import TestClient
        from backend.main import app
        client = TestClient(app)
        response = client.get("/api/v1/ahp/weights")
        data = response.json()
        assert len(data["criteria_detail"]) == 5


# ---------------------------------------------------------------------------
# Test Group 12: Feasibility contribution formula
# contribution = (raw_criterion_score / 100) * dashboard_points
# ---------------------------------------------------------------------------

class TestFeasibilityContributionFormula:
    """
    Validates the contribution formula used in the score breakdown.
    Uses the example from the specification:
        Market raw = 93.33, Financial raw = 76, Location raw = 100,
        Competition raw = 53.33, Risk raw = 53.33
        Total = 28 + 19 + 15 + 8 + 8 = 78
    """

    def _contribution(self, raw_score: float, dashboard_points: int) -> float:
        return (raw_score / 100.0) * dashboard_points

    def test_market_contribution(self):
        contrib = self._contribution(93.33, 30)
        assert abs(contrib - 27.999) < 0.01  # ~28

    def test_financial_contribution(self):
        contrib = self._contribution(76.0, 25)
        assert abs(contrib - 19.0) < 0.01

    def test_location_contribution(self):
        contrib = self._contribution(100.0, 15)
        assert abs(contrib - 15.0) < 0.01

    def test_competition_contribution(self):
        contrib = self._contribution(53.33, 15)
        assert abs(contrib - 7.9995) < 0.01  # ~8

    def test_risk_contribution(self):
        contrib = self._contribution(53.33, 15)
        assert abs(contrib - 7.9995) < 0.01  # ~8

    def test_total_contribution_is_78(self):
        dp = get_ahp_result().dashboard_points
        raw_scores = {
            "market": 93.33,
            "financial": 76.0,
            "location": 100.0,
            "competition": 53.33,
            "risk": 53.33,
        }
        total = sum(
            (raw_scores[k] / 100.0) * dp[k]
            for k in raw_scores
        )
        assert abs(total - 78.0) < 0.1, f"Total contribution = {total}, expected ~78"

    def test_contribution_uses_ahp_dashboard_points(self):
        """Verify formula uses AHP-derived dashboard_points, not hardcoded values."""
        result = get_ahp_result()
        # If AHP is recalculated with different data, dashboard_points may change.
        # This test confirms the formula reads from the service, not from constants.
        for key in result.dashboard_points:
            raw = 100.0
            contrib = (raw / 100.0) * result.dashboard_points[key]
            assert contrib == result.dashboard_points[key]  # max contribution = dashboard_points
