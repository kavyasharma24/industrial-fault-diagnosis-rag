
import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

# Groq configuration
GROQ_MODEL = "openai/gpt-oss-20b"

_client = None


def get_groq_client():
    """
    Lazily initialize and return the Groq client.
    Prevents startup crashes if GROQ_API_KEY is not yet configured,
    while ensuring a clear error when diagnosis synthesis is invoked.
    """
    global _client

    if _client is not None:
        return _client

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError(
            "GROQ_API_KEY not found in environment variables. "
            "Please configure GROQ_API_KEY to enable LLM-synthesized diagnosis."
        )

    _client = Groq(api_key=api_key)
    return _client


def generate_diagnosis(
    sensor_data,
    ml_prediction,
    rag_knowledge,
    kg_evaluation,
    kg_details
):
    """
    Generate evidence-grounded industrial fault diagnosis
    using ML prediction, RAG evidence and Knowledge Graph details.
    """

    system_prompt = """
You are an Industrial Fault Diagnosis Assistant.

Generate an evidence-grounded industrial machine diagnosis.

STRICT RULES:

1. Use only the supplied sensor data, ML prediction,
   retrieved knowledge and Knowledge Graph information.

2. Clearly distinguish ML predictions from KG rule matches.

3. Retrieved RAG documents provide context, not proof
   of an active machine failure.

4. Never describe a failure mode as confirmed merely
   because its documented condition is met.

5. TWF within its documented interval does not
   independently confirm tool failure.

6. RNF is probability-based and cannot be detected
   from the supplied sensor readings.

7. Remedies are project-generated investigation
   recommendations and are not independently validated.

8. Never invent causes, measurements or evidence.

9. Explain uncertainty wherever evidence is insufficient.

10. In this project, HDF means Heat Dissipation Failure.
    Never interpret HDF as Hydrodynamic Film Failure.

11. Do not introduce external theories, bearing models,
    lubricant properties or unsupported explanations.

12. Explain only documented conditions and supplied evidence.

13. Structure your response using these sections:
    - Overall Diagnosis
    - ML Prediction
    - Knowledge Graph Failure-Mode Findings
    - Supporting Retrieved Evidence
    - Investigation Recommendations
    - Limitations and Uncertainty

14. Treat the Knowledge Graph evaluation status as the
    authoritative result of the supplied rule evaluation.
    Never contradict or reinterpret that status.

15. Do not invent missing sensor values, thresholds,
    calculations or explanations.

16. PWF is evaluated using calculated process power:
    Torque × Rotational Speed × 2π / 60.
    Do not claim power is unavailable when the KG
    evaluation explicitly reports its condition status.

17. OSF is evaluated using Tool Wear × Torque
    against the product-quality-specific threshold.
    Never interpret OSF as an overspeed condition.

18. RNF has a documented probability of 0.1%.
    Do not recommend collecting run-time data to
    change this documented probability.

19. If detailed calculation values are absent,
    report only the supplied KG status without
    inventing an explanation.
"""

    user_prompt = f"""
Analyze the following industrial machine information.

SENSOR DATA:
{sensor_data}

ML PREDICTION:
{ml_prediction}

RAG RETRIEVED KNOWLEDGE:
{rag_knowledge}

KNOWLEDGE GRAPH EVALUATION:
{kg_evaluation}

KNOWLEDGE GRAPH DETAILS:
{kg_details}

Generate a clear, structured and evidence-grounded diagnosis.
"""

    # Generate diagnosis using Groq
    client = get_groq_client()
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        max_completion_tokens=1500,
        reasoning_effort="low",
        include_reasoning=False,
        temperature=0.2
    )

    # Extract generated response
    result = response.choices[0].message.content

    # Validate response
    if not result or not result.strip():
        raise ValueError("Groq returned an empty diagnosis.")

    return result
