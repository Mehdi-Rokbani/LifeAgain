import { useState } from "react";
import StepAddress from "../components/StepAddress";
import StepPicture from "../components/StepPicture";

import {  motion,AnimatePresence } from "framer-motion";
import "../assets/styles/onboarding.css";

const Onboarding = () => {
    const [step, setStep] = useState(1);

    const next = () => setStep((s) => s + 1);
    const back = () => setStep((s) => s - 1);

    return (
        <div className="onboarding-container">
            {/* ------------ Step Indicators ------------ */}
            <div className="steps">
                <div className={`step-circle ${step === 1 ? "active" : ""}`}>
                    1
                </div>

                <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>

                <div className={`step-circle ${step === 2 ? "active" : ""}`}>
                    2
                </div>
            </div>

            {/* ------------ Animated Steps ------------ */}
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.35 }}
                        className="step-wrapper"
                    >
                        <StepAddress next={next} />
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.35 }}
                        className="step-wrapper"
                    >
                        <StepPicture back={back} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
