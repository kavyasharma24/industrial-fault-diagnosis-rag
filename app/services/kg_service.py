
from pathlib import Path
import math
import networkx as nx


# Project root directory
BASE_DIR = Path(__file__).resolve().parents[2]

# Knowledge Graph path
GRAPH_PATH = (
    BASE_DIR
    / "Industrial_KG"
    / "graphs"
    / "industrial_knowledge_graph.graphml"
)

# Graph resource
_knowledge_graph = None


def load_knowledge_graph():
    """
    Load the existing Industrial Knowledge Graph once.
    """

    global _knowledge_graph

    if _knowledge_graph is not None:
        return _knowledge_graph

    if not GRAPH_PATH.exists():
        raise FileNotFoundError(
            f"Knowledge Graph file not found: {GRAPH_PATH}"
        )

    _knowledge_graph = nx.read_graphml(GRAPH_PATH)

    print("INDUSTRIAL KNOWLEDGE GRAPH LOADED")
    print("Total nodes:", _knowledge_graph.number_of_nodes())
    print("Total relationships:", _knowledge_graph.number_of_edges())

    return _knowledge_graph


def get_failure_mode_details(failure_mode_id: str):
    """
    Retrieve symptoms, evidence and remedies
    connected to a specific failure mode.
    """

    graph = load_knowledge_graph()

    if failure_mode_id not in graph:
        return None

    failure_node = graph.nodes[failure_mode_id]

    if failure_node.get("node_type") != "Failure_Mode":
        return None

    symptoms = []
    evidence = []
    remedies = []

    # Retrieve symptoms
    for node in graph.predecessors(failure_mode_id):
        node_data = graph.nodes[node]

        if node_data.get("node_type") == "Symptom":
            symptoms.append({
                "node_id": node,
                **node_data
            })

    # Retrieve evidence and remedies
    for node in graph.successors(failure_mode_id):
        node_data = graph.nodes[node]
        relationship = graph.edges[failure_mode_id, node]

        if node_data.get("node_type") == "Evidence":
            evidence.append({
                "node_id": node,
                **node_data
            })

        elif node_data.get("node_type") == "Remedy":
            remedies.append({
                "node_id": node,
                **node_data,
                "relationship_provenance": relationship.get(
                    "provenance"
                )
            })

    return {
        "failure_mode": {
            "node_id": failure_mode_id,
            **failure_node
        },
        "symptoms": symptoms,
        "evidence": evidence,
        "remedies": remedies
    }


def evaluate_failure_conditions(sensor_data, product_quality=None):
    """
    Evaluate documented Knowledge Graph conditions
    using machine sensor readings.

    These rules provide evidence-based indicators.
    They do not independently confirm actual failures.
    """

    required_features = [
        "Air_Temperature",
        "Process_Temperature",
        "Rotational_Speed",
        "Torque",
        "Tool_Wear"
    ]

    # Validate sensor inputs
    missing_features = [
        feature
        for feature in required_features
        if feature not in sensor_data
    ]

    if missing_features:
        raise ValueError(
            f"Missing sensor features: {missing_features}"
        )

    air_temperature = float(sensor_data["Air_Temperature"])
    process_temperature = float(sensor_data["Process_Temperature"])
    rotational_speed = float(sensor_data["Rotational_Speed"])
    torque = float(sensor_data["Torque"])
    tool_wear = float(sensor_data["Tool_Wear"])

    if not all(
        math.isfinite(value)
        for value in [
            air_temperature,
            process_temperature,
            rotational_speed,
            torque,
            tool_wear
        ]
    ):
        raise ValueError("Sensor values must be finite numbers.")

    if rotational_speed < 0 or torque < 0 or tool_wear < 0:
        raise ValueError(
            "Rotational speed, torque and tool wear cannot be negative."
        )

    graph = load_knowledge_graph()

    # HDF: Both documented conditions must hold
    temperature_difference = (
        process_temperature - air_temperature
    )

    hdf_temperature_condition = temperature_difference < 8.6
    hdf_speed_condition = rotational_speed < 1380

    hdf_match = (
        hdf_temperature_condition
        and hdf_speed_condition
    )

    # PWF: Calculate process power in Watts
    power = (
        torque
        * rotational_speed
        * 2
        * math.pi
        / 60
    )

    pwf_match = power < 3500 or power > 9000

    # TWF: Documented tool-wear interval
    twf_match = 200 <= tool_wear <= 240

    # OSF: Product-specific thresholds
    quality_thresholds = {
        "L": 11000,
        "M": 12000,
        "H": 13000
    }

    quality = (
        product_quality.upper()
        if isinstance(product_quality, str)
        else None
    )

    if quality is not None and quality not in quality_thresholds:
        raise ValueError(
            "Product quality must be L, M or H."
        )

    overstrain_value = tool_wear * torque

    if quality is not None:
        osf_threshold = quality_thresholds[quality]
        osf_match = overstrain_value > osf_threshold
        osf_status = (
            "evidence_condition_met"
            if osf_match
            else "evidence_condition_not_met"
        )
    else:
        osf_threshold = None
        osf_match = None
        osf_status = "requires_product_quality"

    # RNF: Documented probability, not sensor-detectable
    rnf_probability = 0.001

    results = {
        "TWF": {
            "failure_mode": "Tool Wear Failure",
            "evidence_node": "EVID_TWF",
            "observed_tool_wear": tool_wear,
            "documented_interval": [200, 240],
            "status": (
                "within_documented_interval"
                if twf_match
                else "outside_documented_interval"
            ),
            "note": (
                "The documented interval indicates a random "
                "tool replacement or failure range; it does "
                "not confirm an actual failure."
            )
        },

        "HDF": {
            "failure_mode": "Heat Dissipation Failure",
            "evidence_node": "EVID_HDF",
            "temperature_difference": temperature_difference,
            "temperature_threshold": 8.6,
            "rotational_speed": rotational_speed,
            "speed_threshold": 1380,
            "temperature_condition_met": hdf_temperature_condition,
            "speed_condition_met": hdf_speed_condition,
            "status": (
                "evidence_condition_met"
                if hdf_match
                else "evidence_condition_not_met"
            )
        },

        "PWF": {
            "failure_mode": "Power Failure",
            "evidence_node": "EVID_PWF",
            "calculated_power_watts": power,
            "lower_threshold": 3500,
            "upper_threshold": 9000,
            "status": (
                "evidence_condition_met"
                if pwf_match
                else "evidence_condition_not_met"
            )
        },

        "OSF": {
            "failure_mode": "Overstrain Failure",
            "evidence_node": "EVID_OSF",
            "tool_wear_times_torque": overstrain_value,
            "product_quality": quality,
            "applicable_threshold": osf_threshold,
            "status": osf_status
        },

        "RNF": {
            "failure_mode": "Random Failure",
            "evidence_node": "EVID_RNF",
            "documented_probability": rnf_probability,
            "probability_percentage": 0.1,
            "status": "probability_only",
            "note": (
                "Random failure is independent of operating "
                "parameters and cannot be identified from "
                "these sensor readings."
            )
        }
    }

    # Verify that all evidence nodes exist in the graph
    for result in results.values():
        evidence_id = result["evidence_node"]

        if evidence_id not in graph:
            raise ValueError(
                f"Evidence node missing from Knowledge Graph: {evidence_id}"
            )

    return {
        "status": "success",
        "evaluation_type": "Knowledge Graph Rule-Based Evaluation",
        "results": results
    }
