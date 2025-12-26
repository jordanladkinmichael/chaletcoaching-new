import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";

// Регистрируем шрифты
Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
});

// Стили для PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Inter",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #fbbf24",
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0E0E10",
    marginBottom: 10,
  },
  logoAccent: {
    color: "#fbbf24",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0E0E10",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0E0E10",
    marginBottom: 15,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 8,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "medium",
  },
  infoValue: {
    fontSize: 12,
    color: "#0E0E10",
    fontWeight: "medium",
  },
  weekSection: {
    marginBottom: 25,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 20,
    backgroundColor: "#fafafa",
  },
  weekTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    backgroundColor: "#fbbf24",
    color: "#0E0E10",
    padding: "8px 16px",
    borderRadius: 6,
    lineHeight: 1.4,
  },
  sessionSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0E0E10",
    marginBottom: 10,
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: 5,
    lineHeight: 1.4,
  },
  exerciseList: {
    marginLeft: 20,
  },
  exercise: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 1.4,
  },
  exerciseDetail: {
    fontSize: 10,
    color: "#6b7280",
    marginLeft: 20,
    marginTop: 2,
    fontStyle: "italic",
    marginBottom: 3,
    lineHeight: 1.4,
  },
  tipsSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 4,
    border: "1px solid #fbbf24",
  },
  tipsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 5,
  },
  tip: {
    fontSize: 10,
    color: "#92400e",
    marginBottom: 3,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1px solid #e5e7eb",
    textAlign: "center",
  },
  footerText: {
    fontSize: 10,
    color: "#9ca3af",
    marginBottom: 5,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 10,
    color: "#9ca3af",
  },
  nutritionSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ecfdf5",
    borderRadius: 6,
    border: "1px solid #10b981",
  },
  nutritionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 10,
  },
  nutritionTip: {
    fontSize: 11,
    color: "#065f46",
    marginBottom: 5,
  },
  generatedContent: {
    marginTop: 20,
    lineHeight: 1.4,
  },
});

interface CoursePDFProps {
  course: {
    title: string;
    options: Record<string, unknown>;
    createdAt: string;
    tokensSpent: number;
    generatedContent?: string;
    images?: string;
    nutritionAdvice?: string;
  };
}

export function CoursePDF({ course }: CoursePDFProps) {
  const options = typeof course.options === "string" 
    ? JSON.parse(course.options) 
    : course.options;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Генерируем реалистичный контент для недель
  const getWeekContent = (weekNumber: number) => {
    const exercises = [
      {
        warmup: [
          "Dynamic stretching (5-7 min)",
          "Light cardio: jumping jacks, high knees (3-5 min)",
          "Mobility work: hip circles, arm circles (2-3 min)"
        ],
        main: [
          "Compound movements: squats, deadlifts, push-ups",
          "Progressive overload: increase weight/reps each week",
          "Rest periods: 2-3 minutes between sets"
        ],
        cooldown: [
          "Static stretching (5-7 min)",
          "Foam rolling for muscle recovery",
          "Deep breathing exercises (2-3 min)"
        ]
      },
      {
        warmup: [
          "Dynamic mobility drills (5-8 min)",
          "Movement prep: cat-cow, bird-dog (3-4 min)",
          "Light resistance band work (2-3 min)"
        ],
        main: [
          "Strength focus: deadlifts, rows, overhead press",
          "Accessory work: bicep curls, tricep extensions",
          "Core training: planks, Russian twists"
        ],
        cooldown: [
          "Gentle stretching (5-8 min)",
          "Self-massage with tennis ball",
          "Hydration and protein timing"
        ]
      },
      {
        warmup: [
          "Cardio warmup: jogging in place (5 min)",
          "Dynamic stretching sequence (5-7 min)",
          "Movement rehearsal (3-4 min)"
        ],
        main: [
          "Power training: explosive movements",
          "Circuit training: 3-4 exercises",
          "High intensity intervals"
        ],
        cooldown: [
          "Active recovery: walking (3-5 min)",
          "Static stretching (5-7 min)",
          "Recovery protocols"
        ]
      },
      {
        warmup: [
          "Joint mobility work (5-6 min)",
          "Light resistance training (4-5 min)",
          "Movement patterns practice (3-4 min)"
        ],
        main: [
          "Endurance focus: higher reps, lower weight",
          "Functional movements: lunges, step-ups",
          "Balance and stability work"
        ],
        cooldown: [
          "Gentle stretching (5-6 min)",
          "Recovery breathing (2-3 min)",
          "Next session planning"
        ]
      }
    ];

    const weekIndex = (weekNumber - 1) % exercises.length;
    return exercises[weekIndex] || exercises[0];
  };

  // Генерируем советы по питанию
  const getNutritionTips = () => {
    return [
      "Eat protein within 30 minutes after workout (20-30g)",
      "Stay hydrated: drink water before, during, and after exercise",
      "Include complex carbs 2-3 hours before training",
      "Consider BCAAs during longer sessions",
      "Post-workout meal: protein + carbs in 2:1 ratio"
    ];
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            AI<span style={styles.logoAccent}>Fit</span>World
          </Text>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.subtitle}>
            Personalized fitness program generated by AI
          </Text>
        </View>

        {/* Course Information */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Program Details</Text>
          <View style={styles.infoGrid}>
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>{options.weeks || 4} weeks</Text>
          </View>
          <View style={styles.infoGrid}>
            <Text style={styles.infoLabel}>Sessions per week:</Text>
            <Text style={styles.infoValue}>{options.sessionsPerWeek || 4}</Text>
          </View>
          <View style={styles.infoGrid}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{formatDate(course.createdAt)}</Text>
          </View>
          <View style={styles.infoGrid}>
            <Text style={styles.infoLabel}>Tokens spent:</Text>
            <Text style={styles.infoValue}>{course.tokensSpent} ◎</Text>
          </View>
          
          {/* Additional features */}
          {options.injurySafe && (
            <View style={styles.infoGrid}>
              <Text style={styles.infoLabel}>Features:</Text>
              <Text style={styles.infoValue}>Injury-safe modifications</Text>
            </View>
          )}
          {options.nutritionTips && (
            <View style={styles.infoGrid}>
              <Text style={styles.infoLabel}>Features:</Text>
              <Text style={styles.infoValue}>Nutrition tips included</Text>
            </View>
          )}
        </View>

        {/* Weekly Program */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Weekly Program</Text>
          
          {course.generatedContent ? (
            // Используем сгенерированный контент от OpenAI
            <View style={styles.generatedContent}>
              {course.generatedContent.split('\n').map((line, index) => {
                if (line.trim() === '') return null;
                
                // Определяем стиль в зависимости от содержимого строки
                let textStyle = styles.exercise;
                if (line.includes('Week') && line.includes(':')) {
                  textStyle = styles.weekTitle;
                } else if (line.includes('Session') && line.includes(':')) {
                  textStyle = styles.sessionTitle;
                } else if (line.startsWith('•') || line.startsWith('-')) {
                  textStyle = styles.exerciseDetail;
                } else if (line.includes(':')) {
                  textStyle = styles.exercise;
                }
                
                return (
                  <Text key={index} style={textStyle}>
                    {line}
                  </Text>
                );
              })}
            </View>
          ) : (
            // Fallback на статический контент
            Array.from({ length: options.weeks || 4 }, (_, i) => (
              <View key={i} style={styles.weekSection}>
                <Text style={styles.weekTitle}>Week {i + 1}</Text>
                
                {Array.from({ length: options.sessionsPerWeek || 4 }, (_, j) => {
                  const sessionContent = getWeekContent(i + 1);
                  return (
                    <View key={j} style={styles.sessionSection}>
                      <Text style={styles.sessionTitle}>Session {j + 1}</Text>
                      
                      {/* Warmup */}
                      <View style={styles.exerciseList}>
                        <Text style={styles.exercise}>🔥 Warmup:</Text>
                        {sessionContent.warmup.map((exercise, index) => (
                          <Text key={index} style={styles.exerciseDetail}>• {exercise}</Text>
                        ))}
                      </View>

                      {/* Main Workout */}
                      <View style={styles.exerciseList}>
                        <Text style={styles.exercise}>💪 Main Workout:</Text>
                        {sessionContent.main.map((exercise, index) => (
                          <Text key={index} style={styles.exerciseDetail}>• {exercise}</Text>
                        ))}
                      </View>

                      {/* Cooldown */}
                      <View style={styles.exerciseList}>
                        <Text style={styles.exercise}>🧘 Cooldown:</Text>
                        {sessionContent.cooldown.map((exercise, index) => (
                          <Text key={index} style={styles.exerciseDetail}>• {exercise}</Text>
                        ))}
                      </View>

                                             {/* Weekly Tips */}
                       <View style={styles.tipsSection}>
                         <Text style={styles.tipsTitle}>💡 Week {i + 1} Tips:</Text>
                         <Text style={styles.tip}>• Focus on form over weight</Text>
                         <Text style={styles.tip}>• Listen to your body</Text>
                         <Text style={styles.tip}>• Track your progress</Text>
                       </View>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>

        {/* Nutrition Tips */}
        {options.nutritionTips && (
          <View style={styles.nutritionSection}>
            <Text style={styles.nutritionTitle}>🍎 Nutrition Tips</Text>
            {course.nutritionAdvice ? (
              // Используем сгенерированные советы по питанию
              course.nutritionAdvice.split('\n').map((tip, index) => {
                if (tip.trim() === '') return null;
                return (
                  <Text key={index} style={styles.nutritionTip}>• {tip}</Text>
                );
              })
            ) : (
              // Fallback на статические советы
              getNutritionTips().map((tip, index) => (
                <Text key={index} style={styles.nutritionTip}>• {tip}</Text>
              ))
            )}
          </View>
        )}

        {/* Generated Images */}
        {course.images && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Generated Images</Text>
            <Text style={styles.exercise}>
              {(() => {
                try {
                  const imageUrls = JSON.parse(course.images);
                  return `Generated ${imageUrls.length} fitness images for this program.`;
                } catch {
                  return "Generated fitness images for this program.";
                }
              })()}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This program is for informational purposes only and is not medical advice.
          </Text>
          <Text style={styles.footerText}>
            Consult a healthcare professional before starting any new fitness program.
          </Text>
          <Text style={styles.footer}>Generated by Chaletcoaching • {formatDate(course.createdAt)}</Text>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => 
          `${pageNumber} / ${totalPages}`
        } />
      </Page>
    </Document>
  );
}

// Компонент для предварительного просмотра PDF
export function PDFPreview({ course }: CoursePDFProps) {
  return (
    <div className="w-full h-96 border rounded-lg overflow-hidden">
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <CoursePDF course={course} />
      </PDFViewer>
    </div>
  );
}
