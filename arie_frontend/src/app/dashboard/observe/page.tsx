"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    getTeens,
    createObservation,
    transcribeAudio,
    type Teen,
    type ObservationResult,
} from "@/lib/api";

const DIMENSION_LABELS: Record<string, string> = {
    task_performance: "Task Performance",
    supervision_independence: "Supervision Independence",
    behavioral_stability: "Behavioral Stability",
    cognitive_adaptability: "Cognitive Adaptability",
    consistency: "Consistency",
};

export default function ObservePage() {
    const router = useRouter();
    const [teens, setTeens] = useState<Teen[]>([]);
    const [selectedTeen, setSelectedTeen] = useState("");
    const [rawText, setRawText] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<ObservationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Voice input state
    const [voiceLang, setVoiceLang] = useState<"en" | "hi">("en");
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        getTeens()
            .then(setTeens)
            .catch((e) => console.error("Failed to load teens:", e));
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : "audio/webm",
            });

            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all tracks to release the microphone
                stream.getTracks().forEach((track) => track.stop());
                setIsRecording(false);

                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

                if (audioBlob.size < 100) {
                    setError("Recording too short — try speaking longer.");
                    return;
                }

                setIsTranscribing(true);
                try {
                    const res = await transcribeAudio(audioBlob, voiceLang);
                    if (res.text) {
                        setRawText((prev) => {
                            const separator = prev.trim() ? " " : "";
                            return prev + separator + res.text;
                        });
                    } else if (res.error) {
                        setError(`Transcription failed: ${res.error}`);
                    } else {
                        setError("No speech detected — try again.");
                    }
                } catch (e) {
                    setError(e instanceof Error ? e.message : "Transcription failed");
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
            setError(null);
        } catch (e) {
            console.error("Microphone access denied:", e);
            setError("Microphone access denied. Please allow microphone permissions.");
        }
    }, [voiceLang]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, stopRecording, startRecording]);

    const handleAnalyze = async () => {
        if (!selectedTeen || rawText.trim().length < 10) return;
        setAnalyzing(true);
        setResult(null);
        setError(null);

        try {
            const res = await createObservation({
                teen_id: selectedTeen,
                raw_text: rawText.trim(),
            });
            setResult(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Analysis failed");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setRawText("");
        setError(null);
    };

    const deltaColor = (val: number) => {
        if (val > 0) return "delta-positive";
        if (val < 0) return "delta-negative";
        return "delta-neutral";
    };

    return (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ marginBottom: 36 }}>
                <h1
                    style={{
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        letterSpacing: "-0.01em",
                        marginBottom: 6,
                    }}
                >
                    Record an Observation
                </h1>
                <p className="status-line">
                    Describe what you observed — type or use voice input. English,
                    Hindi, and Hinglish are all supported.
                </p>
            </div>

            {/* Input Section */}
            {!result && (
                <div className="card" style={{ marginBottom: 24 }}>
                    {/* Teen Selector */}
                    <div style={{ marginBottom: 20 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                marginBottom: 8,
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            Participant
                        </label>
                        <select
                            className="select"
                            value={selectedTeen}
                            onChange={(e) => setSelectedTeen(e.target.value)}
                        >
                            <option value="">Select a participant...</option>
                            {teens.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} (Age {t.age})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Observation Text + Voice Input */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <label
                                style={{
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                What did you observe?
                            </label>

                            {/* Voice controls */}
                            {
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {/* Language toggle */}
                                    <div
                                        style={{
                                            display: "flex",
                                            borderRadius: 8,
                                            overflow: "hidden",
                                            border: "1px solid var(--color-border)",
                                            fontSize: "0.6875rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setVoiceLang("en")}
                                            style={{
                                                padding: "4px 10px",
                                                border: "none",
                                                cursor: "pointer",
                                                background: voiceLang === "en" ? "var(--color-accent)" : "transparent",
                                                color: voiceLang === "en" ? "#fff" : "var(--color-text-secondary)",
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            EN
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVoiceLang("hi")}
                                            style={{
                                                padding: "4px 10px",
                                                border: "none",
                                                cursor: "pointer",
                                                background: voiceLang === "hi" ? "var(--color-accent)" : "transparent",
                                                color: voiceLang === "hi" ? "#fff" : "var(--color-text-secondary)",
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            हिं
                                        </button>
                                    </div>

                                    {/* Mic button */}
                                    <button
                                        type="button"
                                        onClick={toggleRecording}
                                        title={isRecording ? "Stop recording" : `Start voice input (${voiceLang === "en" ? "English" : "Hindi"})`}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "50%",
                                            border: isRecording ? "2px solid var(--color-danger)" : "1px solid var(--color-border)",
                                            background: isRecording ? "var(--color-danger)" : "transparent",
                                            color: isRecording ? "#fff" : "var(--color-text-secondary)",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.1rem",
                                            transition: "all 0.2s ease",
                                            animation: isRecording ? "pulse 1.5s ease-in-out infinite" : "none",
                                        }}
                                    >
                                        {isRecording ? "◼" : "🎤"}
                                    </button>
                                </div>
                            }
                        </div>

                        {/* Recording / Transcribing indicator */}
                        {(isRecording || isTranscribing) && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "8px 14px",
                                    marginBottom: 8,
                                    borderRadius: 10,
                                    background: isRecording ? "#FEF2F2" : "#F0F4FF",
                                    fontSize: "0.8125rem",
                                    color: isRecording ? "var(--color-danger)" : "var(--color-accent)",
                                    fontWeight: 600,
                                }}
                            >
                                {isRecording ? (
                                    <>
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-danger)", animation: "pulse 1s ease-in-out infinite" }} />
                                        Recording ({voiceLang === "en" ? "English" : "Hindi"})... tap stop when done
                                    </>
                                ) : (
                                    <>
                                        <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                        Transcribing...
                                    </>
                                )}
                            </div>
                        )}

                        <textarea
                            className="textarea"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder={voiceLang === "hi"
                                ? "Type or speak your observation... Hindi/Hinglish supported. e.g. Aaj usne sab kaam khud kiya aur doosre bacchon ki bhi madad ki."
                                : "Type or speak your observation... e.g. Needed a reminder twice during the packaging task. Lost focus after 20 minutes but resumed after encouragement."
                            }
                            style={{ minHeight: 150 }}
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: 6,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    color:
                                        rawText.length < 10
                                            ? "var(--color-text-secondary)"
                                            : "var(--color-positive)",
                                }}
                            >
                                {rawText.length < 10
                                    ? `${10 - rawText.length} more characters needed`
                                    : "Ready to analyze"}
                            </span>
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {rawText.length} chars
                            </span>
                        </div>
                    </div>

                    {/* Analyze Button */}
                    <button
                        className="btn-primary"
                        onClick={handleAnalyze}
                        disabled={analyzing || !selectedTeen || rawText.trim().length < 10}
                        style={{ width: "100%", padding: "13px 20px" }}
                    >
                        {analyzing ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                Analyzing...
                            </span>
                        ) : (
                            "Analyze Observation"
                        )}
                    </button>

                    {error && (
                        <div
                            style={{
                                marginTop: 14,
                                padding: "12px 16px",
                                background: "#F9EEEE",
                                borderRadius: 12,
                                fontSize: "0.8125rem",
                                color: "var(--color-danger)",
                            }}
                        >
                            {error}
                        </div>
                    )}
                </div>
            )}

            {/* Results Section */}
            {result && (
                <div>
                    {/* Success Banner */}
                    <div
                        className="card"
                        style={{
                            marginBottom: 20,
                            borderColor: "var(--color-positive)",
                            borderWidth: 1,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: "0.9375rem",
                                        fontWeight: 700,
                                        color: "var(--color-positive)",
                                        marginBottom: 4,
                                    }}
                                >
                                    Observation Recorded
                                </div>
                                <span
                                    style={{
                                        fontSize: "0.8125rem",
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Source:{" "}
                                    <span className="data-mono">
                                        {result.delta_source.toUpperCase()}
                                    </span>
                                </span>
                            </div>
                            {result.change_report && (
                                <div style={{ textAlign: "right" }}>
                                    <div
                                        className="score-display"
                                        style={{
                                            fontSize: "1.75rem",
                                            color:
                                                result.change_report.readiness_score_change >= 0
                                                    ? "var(--color-positive)"
                                                    : "var(--color-danger)",
                                        }}
                                    >
                                        {result.change_report.readiness_score_change >= 0
                                            ? "+"
                                            : ""}
                                        {result.change_report.readiness_score_change.toFixed(2)}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {result.change_report.readiness_score_before.toFixed(1)} →{" "}
                                        {result.change_report.readiness_score_after.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Extracted Deltas */}
                    {result.observation.structured_delta && (
                        <div className="card" style={{ marginBottom: 20 }}>
                            <div className="section-title">Behavioral Changes Detected</div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(5, 1fr)",
                                    gap: 12,
                                }}
                            >
                                {Object.entries(result.observation.structured_delta).map(
                                    ([dim, val]) => {
                                        const num = val as number;
                                        return (
                                            <div
                                                key={dim}
                                                style={{
                                                    textAlign: "center",
                                                    padding: "14px 8px",
                                                    borderRadius: 14,
                                                    background: "var(--color-bg)",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: "0.6875rem",
                                                        color: "var(--color-text-secondary)",
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    {DIMENSION_LABELS[dim] || dim}
                                                </div>
                                                <div
                                                    className={`score-display ${deltaColor(num)}`}
                                                    style={{ fontSize: "1.25rem" }}
                                                >
                                                    {num > 0 ? "+" : ""}
                                                    {num}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}

                    {/* NLP Reasoning */}
                    {result.nlp_reasoning && (
                        <div className="card" style={{ marginBottom: 20 }}>
                            <div className="section-title">Analysis Reasoning</div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                }}
                            >
                                {Object.entries(result.nlp_reasoning).map(([dim, reason]) => (
                                    <div
                                        key={dim}
                                        style={{
                                            padding: "12px 14px",
                                            borderRadius: 14,
                                            background: "var(--color-bg)",
                                            borderLeft: `3px solid ${result.observation.structured_delta &&
                                                (result.observation.structured_delta[dim] as number) > 0
                                                ? "var(--color-positive)"
                                                : result.observation.structured_delta &&
                                                    (result.observation.structured_delta[dim] as number) < 0
                                                    ? "var(--color-danger)"
                                                    : "var(--color-border)"
                                                }`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                color: "var(--color-text-secondary)",
                                                marginBottom: 4,
                                            }}
                                        >
                                            {DIMENSION_LABELS[dim] || dim}
                                        </div>
                                        <div style={{ fontSize: "0.8125rem", lineHeight: 1.6 }}>
                                            {reason}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dimension Changes */}
                    {result.change_report &&
                        Object.keys(result.change_report.dimension_changes).length > 0 && (
                            <div className="card" style={{ marginBottom: 20 }}>
                                <div className="section-title">Dimension Impact</div>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr
                                            style={{
                                                borderBottom: "1px solid var(--color-border)",
                                            }}
                                        >
                                            <th
                                                style={{
                                                    textAlign: "left",
                                                    padding: "10px 0",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Dimension
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: "right",
                                                    padding: "10px 0",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Before
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: "right",
                                                    padding: "10px 0",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                After
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: "right",
                                                    padding: "10px 0",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Change
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(result.change_report.dimension_changes).map(
                                            ([dim, change]) => (
                                                <tr
                                                    key={dim}
                                                    style={{
                                                        borderBottom: "1px solid var(--color-border)",
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            padding: "12px 0",
                                                            fontSize: "0.8125rem",
                                                        }}
                                                    >
                                                        {DIMENSION_LABELS[dim] || dim}
                                                    </td>
                                                    <td
                                                        className="data-mono"
                                                        style={{
                                                            textAlign: "right",
                                                            padding: "12px 0",
                                                            fontSize: "0.8125rem",
                                                        }}
                                                    >
                                                        {change.before.toFixed(1)}
                                                    </td>
                                                    <td
                                                        className="data-mono"
                                                        style={{
                                                            textAlign: "right",
                                                            padding: "12px 0",
                                                            fontSize: "0.8125rem",
                                                        }}
                                                    >
                                                        {change.after.toFixed(1)}
                                                    </td>
                                                    <td
                                                        className={`data-mono ${deltaColor(change.change)}`}
                                                        style={{
                                                            textAlign: "right",
                                                            padding: "12px 0",
                                                            fontSize: "0.8125rem",
                                                        }}
                                                    >
                                                        {change.change > 0 ? "+" : ""}
                                                        {change.change.toFixed(1)}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 12 }}>
                        <button className="btn-primary" onClick={handleReset}>
                            New Observation
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => router.push(`/dashboard/teen/${result.observation.teen_id}`)}
                        >
                            View Participant →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
