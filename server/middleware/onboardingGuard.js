import User from "../models/User.js";

export const blockIfOnboarded = async (req, res, next) => {
    const user = await User.findById(req.user.id).select("onboardingCompleted");

    if (user?.onboardingCompleted) {
        return res.status(403).json({
            message: "Onboarding already completed"
        });
    }

    next();
};
