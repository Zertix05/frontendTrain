"use client";
import { motion } from "framer-motion";
import { useState,useEffect } from "react";
import { useUserFlow } from "@/store/useUserFlow";
import { useAuth } from "@/store/useAuth";
import AuthModal from "./AuthModal";
import CustomPopup from "./CustomPopup";
// --------------------
// PLAN TYPE
// --------------------
type Plan = {
  id: number;
  name: string;
  price: string;
  description: string[];
  popular: boolean;
  gradient: string;
};

// --------------------
// BACKEND PRICING TYPE
// --------------------
type BackendPricing = {
  id: number;
  name: string;
  price: string | number;
  description?: string | null;
  audioLimit?: number | null;
  videoLimit?: number | null;
  textLimit?: number | null;
  isPopular?: boolean;
};

// --------------------
// GRADIENT MAPPING
// --------------------
const gradients = [
  "from-[#ffc1d4]/40 to-[#ffd4c4]/50",
  "from-[#f55c93] to-[#ff7bad]",
  "from-[#ffd89c] to-[#ffb67a]",
  "from-[#a8e6cf] to-[#56ab91]",
  "from-[#c7b3ff] to-[#9370db]",
];

// --------------------
// HELPER: Convert backend pricing to frontend Plan
// --------------------
function convertBackendPricingToPlan(pricing: BackendPricing, index: number): Plan {
  const description: string[] = [];

  // Format text feature
  if (pricing.textLimit !== undefined && pricing.textLimit !== null) {
    description.push(pricing.textLimit === 0 ? "∞ Text" : `${pricing.textLimit} Text`);
  } else {
    description.push("∞ Text"); // Default to unlimited if not specified
  }

  // Format audio feature
  if (pricing.audioLimit !== undefined && pricing.audioLimit !== null) {
    description.push(pricing.audioLimit === 0 ? "∞ Audio" : `${pricing.audioLimit} Audio`);
  } else {
    description.push("∞ Audio"); // Default to unlimited if not specified
  }

  // Format video feature
  if (pricing.videoLimit !== undefined && pricing.videoLimit !== null) {
    if (pricing.videoLimit === 0) {
      description.push("∞ Video");
    } else {
      description.push(`${pricing.videoLimit} Video`);
    }
  } else {
    description.push("No Video"); // Default to no video if not specified
  }

  // Handle price conversion
  const priceValue = typeof pricing.price === 'string' ? pricing.price : pricing.price.toFixed(2);

  return {
    id: pricing.id,
    name: pricing.name,
    price: priceValue,
    description,
    popular: pricing.isPopular || false,
    gradient: gradients[index % gradients.length],
  };
}



const Plans = () => {
  const {setPricingId}= useUserFlow();
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updatePlan);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // ✅ Fetch pricing plans from backend
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setIsLoading(true);

        const response = await fetch("/api/pricing");

        if (!response.ok) {
          throw new Error("Failed to fetch pricing plans");
        }

        const data = await response.json();

        // Check if data is an array or has a data property
        const pricingArray = Array.isArray(data) ? data : data.data || [];

        // Convert backend pricing to frontend Plan format
        const convertedPlans = pricingArray.map((pricing: BackendPricing, index: number) =>
          convertBackendPricingToPlan(pricing, index)
        );

        // Filter unique plans by name (keeping the first occurrence of each name)
        const uniquePlans = convertedPlans.reduce((acc: Plan[], current: Plan) => {
          const existingPlan = acc.find(plan => plan.name === current.name);
          if (!existingPlan) {
            acc.push(current);
          }
          return acc;
        }, []);

        // Sort by price: Basic, Plus, Premium
        const sortedPlans = uniquePlans.sort((a: Plan, b: Plan) => {
          const priceA = parseFloat(a.price);
          const priceB = parseFloat(b.price);
          return priceA - priceB;
        });

        // Mark middle plan as popular (if we have 3 plans)
        if (sortedPlans.length === 3) {
          sortedPlans[1].popular = true;
        }

        setPlans(sortedPlans);
      } catch (error) {
        console.error("❌ Error fetching pricing:", error);

        // Fallback to default plans if backend fails
        const fallbackPlans: Plan[] = [
          {
            id: 1,
            name: "Basic",
            price: "49.00",
            description: ["∞ Text", "100 Audio", "No Video"],
            gradient: "from-[#ffc1d4]/40 to-[#ffd4c4]/50",
            popular: false,
          },
        ];

        setPlans(fallbackPlans);
        setPopupMessage("Unable to load all pricing plans. Showing available options.");
        setPopupOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricing();
  }, []);

 useEffect(() => {
   if (!popupOpen) return;

   const t = setTimeout(() => setPopupOpen(false), 6000);
   return () => clearTimeout(t);
 }, [popupOpen]);
 
 

  // --------------------
  // ✅ JSX
  // --------------------
  return (
    <>
    <section
      id="plans"
      className="relative px-6 md:px-16 py-20 md:py-32 max-w-7xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="inline-block bg-white/60 backdrop-blur-sm border-2 border-[#f55c93]/30 rounded-full px-8 py-4">
          <span className="text-5xl font-bold text-[#f55c93] mr-4">
            03
          </span>
          <span className="text-2xl md:text-3xl text-[#2b2530]">
            Choose Your Plan
          </span>
        </div>
      </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[500px]">
            <div className="text-center">
              <div className="inline-block w-16 h-16 border-4 border-[#f55c93] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xl text-[#2b2530]/70">Loading pricing plans...</p>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex justify-center items-center min-h-[500px]">
            <div className="text-center">
              <p className="text-xl text-[#2b2530]/70 mb-4">No pricing plans available</p>
              <p className="text-sm text-[#2b2530]/50">Please contact support for more information</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/4 -translate-x-1/2 bg-pink-200 px-6 py-2 rounded-full text-xl font-bold text-[#2b2530] z-10">
                  Popular
                </div>
              )}

              <div
                className={`bg-linear-to-br ${plan.gradient} rounded-3xl p-8 md:p-10 shadow-lg min-h-[500px] flex flex-col`}
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  {plan.name}
                </h3>

                <div className="text-4xl md:text-5xl font-bold mb-6">
                  ${plan.price}
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 grow">
                  <ul className="space-y-4">
                    {plan.description.map((feature, idx) => (
                      <li key={idx} className="text-lg text-[#2b2530]">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                onClick={async () => {
  console.log("💳 Plan selected:", { planId: plan.id, planName: plan.name });

  // ✅ ОТКРЫВАЕМ POPUP
  setPopupMessage("Maite is coming soon! Join our early access list and get 50% off your first subscription");
  setPopupOpen(true);

  setPricingId(plan.id);

  if (user) {
    await updateUser(plan.id);
    console.log("✅ Plan update completed");
  } else {
    setIsModalOpen(true);
  }
}}

                  className="mt-auto w-full py-4 rounded-full font-medium text-lg shadow-lg bg-linear-to-r from-[#ffc1d4] to-[#f55c93] text-white"
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
        )}
    </section>

    <AuthModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      initialMode="register"
    />
    <CustomPopup
            isOpen={popupOpen}
            onClose={() => setPopupOpen(false)}
            message={popupMessage}
          />
    </>
  );
};

export default Plans;
