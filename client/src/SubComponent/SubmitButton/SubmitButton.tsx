import React from 'react'
import "./SubmitButton.css";

function SubmitButton({ disabled, loading }: { disabled: boolean, loading: boolean }) {
    return (
        <>
            <button className="submit-button mt-16 py-5" type="submit" disabled={disabled}>
                {loading ? (
                    <span className="loading loading-spinner"></span>
                ) : (
                    "Enregistrer"
                )}
            </button>
        </>
    )
}

export default SubmitButton;