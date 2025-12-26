import { NextResponse } from "next/server";

/**
 * Featured program types / Popular requests
 * Public endpoint - no auth required
 * Returns featured program types that users can request
 */
export async function GET() {
  try {
    // Featured program types (these are "popular requests" that users can generate)
    const featuredPrograms = [
      {
        id: "strength-foundation",
        title: "Strength Foundation",
        description: "Build a solid strength base with progressive overload. Perfect for beginners and intermediates.",
        category: "Strength",
        image: "/images/strength-portrait.webp",
        tags: ["Full-Body Strength", "Progressive Overload"],
        deliveryTime: "48–96h",
      },
      {
        id: "fat-loss-hiit",
        title: "Fat Loss HIIT",
        description: "High-intensity interval training designed for maximum calorie burn and metabolic boost.",
        category: "Fat Loss",
        image: "/images/hiit-motion.webp",
        tags: ["HIIT", "Cardio"],
        deliveryTime: "48–96h",
      },
      {
        id: "knee-safe-lower",
        title: "Knee-Safe Lower Body",
        description: "Lower body training that protects your knees while building strength and mobility.",
        category: "Mobility",
        image: "/images/mobility-yoga.webp",
        tags: ["Injury-Safe", "Lower Body"],
        deliveryTime: "48–96h",
      },
      {
        id: "home-minimal",
        title: "Home Minimal Equipment",
        description: "Effective workouts you can do at home with minimal or no equipment.",
        category: "Home",
        image: "/images/at-home-setup.webp",
        tags: ["Home", "Minimal Equipment"],
        deliveryTime: "48–96h",
      },
      {
        id: "postpartum-recovery",
        title: "Postpartum Recovery",
        description: "Safe, progressive return to fitness after childbirth. Designed with medical guidance principles.",
        category: "Postpartum",
        image: "/images/serene-yoga-pose.webp",
        tags: ["Injury-Safe", "Postpartum"],
        deliveryTime: "48–96h",
      },
      {
        id: "mobility-flexibility",
        title: "Mobility & Flexibility",
        description: "Improve range of motion, reduce stiffness, and enhance movement quality.",
        category: "Mobility",
        image: "/images/mobility-yoga.webp",
        tags: ["Mobility", "Flexibility"],
        deliveryTime: "48–96h",
      },
      {
        id: "upper-body-focus",
        title: "Upper Body Focus",
        description: "Target chest, back, shoulders, and arms with structured progressive training.",
        category: "Strength",
        image: "/images/athletes-perfect-form.webp",
        tags: ["Upper Body", "Strength"],
        deliveryTime: "48–96h",
      },
      {
        id: "cardio-endurance",
        title: "Cardio Endurance",
        description: "Build cardiovascular fitness and endurance with structured interval training.",
        category: "Cardio",
        image: "/images/dynamic-dumbbell-thruster.webp",
        tags: ["Cardio", "Endurance"],
        deliveryTime: "48–96h",
      },
    ];

    return NextResponse.json({ programs: featuredPrograms });
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured courses" },
      { status: 500 }
    );
  }
}

