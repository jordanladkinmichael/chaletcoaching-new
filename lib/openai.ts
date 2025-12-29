import OpenAI from 'openai';

// Инициализация OpenAI клиента
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Типы для генерации контента
export interface FitnessContentRequest {
  weeks: number;
  sessionsPerWeek: number;
  injurySafe: boolean;
  specialEquipment: boolean;
  nutritionTips: boolean;
  workoutTypes: string[];
  targetMuscles: string[];
  gender: "male" | "female";
}

export interface GeneratedContent {
  workoutPlan: string;
  nutritionAdvice?: string;
  safetyTips?: string;
  equipmentGuide?: string;
}

// Мэппинг мышц → упражнения для DALL-E 3
const MUSCLE_EXERCISE_MAP = {
  // Chest
  "Upper chest": "incline dumbbell press",
  "Mid chest": "flat barbell bench press", 
  "Lower chest": "decline push-ups on handles",
  "Pec minor": "ring/parallel bar dip",
  "Serratus": "push-up plus",
  
  // Back
  "Lats": "pull-up / lat pulldown",
  "Upper traps": "barbell shrug",
  "Mid traps": "chest-supported row",
  "Lower traps": "prone Y-raise",
  "Rhomboids": "face pull",
  "Teres major/minor, Infraspinatus": "cable external rotation",
  "Erector spinae": "barbell RDL",
  
  // Shoulders
  "Anterior deltoid": "barbell overhead press",
  "Lateral deltoid": "dumbbell lateral raise",
  "Posterior deltoid": "reverse fly",
  
  // Arms
  "Biceps long/short": "incline DB curl / EZ-bar curl",
  "Brachialis": "hammer curl",
  "Triceps long/lateral/medial": "overhead extension / cable pushdown",
  "Forearm flexors/extensors": "wrist curls / reverse wrist curls",
  
  // Core
  "Upper abs": "crunch on mat",
  "Lower abs": "reverse crunch / hanging knee raise",
  "External/Internal obliques": "side plank / pallof press",
  "Transverse abdominis": "dead bug",
  "Multifidus": "bird-dog",
  
  // Hips & Glutes
  "Gluteus maximus": "barbell hip thrust",
  "Gluteus medius/minimus": "side-lying abduction / banded lateral walk",
  "TFL": "banded lateral walk",
  "Hip flexors (iliopsoas)": "hanging leg raise",
  "Adductors": "copenhagen plank",
  "Abductors": "cable hip abduction",
  
  // Legs
  "Quads RF/VL/VM/VI": "back squat / bulgarian split squat",
  "Hamstrings BF/ST/SM": "romanian deadlift / nordic curl",
  "Calves (gastroc medial/lateral)": "standing calf raise",
  "Soleus": "seated calf raise",
  "Tibialis anterior": "tib raises",
  
  // Neck
  "SCM": "supine neck flexion",
  "Deep neck extensors": "prone neck extension"
};

// Генерация плана тренировок
export async function generateWorkoutPlan(request: FitnessContentRequest): Promise<string> {
  try {
    const prompt = buildWorkoutPrompt(request);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional fitness trainer and nutritionist. Create detailed, safe, and effective workout plans. Always prioritize safety and proper form."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Failed to generate workout plan";
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw new Error('Failed to generate workout plan');
  }
}

// Генерация изображений с DALL-E 3 (обновленная система)
export async function generateFitnessImages(request: FitnessContentRequest, count: number = 4): Promise<string[]> {
  try {
    // Ограничиваем количество изображений для экономии токенов
    const maxImages = Math.min(count, 4);
    const imageUrls: string[] = [];
    
    // Генерируем изображения последовательно для лучшего контроля
    for (let i = 0; i < maxImages; i++) {
      try {
        const imageType = ['hero', 'technique', 'macro'][i % 3];
        const prompt = buildAdvancedImagePrompt(request, imageType);
        
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        });
        
        if (response.data?.[0]?.url) {
          imageUrls.push(response.data[0].url);
          console.log(`Generated image ${i + 1}/${maxImages}: ${response.data[0].url}`);
        }
        
        // Небольшая пауза между запросами для избежания rate limits
        if (i < maxImages - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (imageError) {
        console.warn(`Failed to generate image ${i + 1}:`, imageError);
        // Продолжаем генерацию остальных изображений
      }
    }
    
    if (imageUrls.length === 0) {
      console.warn("All image generation attempts failed, returning empty array");
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Error in generateFitnessImages:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
}

// Построение промпта для тренировок
function buildWorkoutPrompt(request: FitnessContentRequest): string {
  const { weeks, sessionsPerWeek, injurySafe, specialEquipment, nutritionTips, workoutTypes, targetMuscles, gender } = request;
  
  let prompt = `Create a ${weeks}-week fitness program with ${sessionsPerWeek} sessions per week for a ${gender} person.`;
  
  if (workoutTypes.length > 0) {
    prompt += ` Focus on these workout types: ${workoutTypes.join(', ')}.`;
  }
  
  if (targetMuscles.length > 0) {
    prompt += ` Target these muscle groups: ${targetMuscles.join(', ')}.`;
  }
  
  if (injurySafe) {
    prompt += ` Include injury-safe modifications and alternatives.`;
  }
  
  if (specialEquipment) {
    prompt += ` Include exercises that require special equipment.`;
  }
  
  if (nutritionTips) {
    prompt += ` Include nutrition advice for each week.`;
  }
  
  prompt += `\n\nProvide a detailed weekly breakdown with specific exercises, sets, reps, and rest periods. Include warm-up and cool-down routines.`;
  
  return prompt;
}

// Построение продвинутого промпта для изображений
function buildAdvancedImagePrompt(request: FitnessContentRequest, imageType: string): string {
  const { workoutTypes, targetMuscles, gender, specialEquipment } = request;
  
  // Выбираем основной тип тренировки и целевую мышцу
  const primaryWorkoutType = workoutTypes.length > 0 ? workoutTypes[0] : 'strength training';
  const primaryMuscle = targetMuscles.length > 0 ? targetMuscles[0] : 'full body';
  
  // Получаем упражнение для целевой мышцы
  const exerciseForMuscle = MUSCLE_EXERCISE_MAP[primaryMuscle as keyof typeof MUSCLE_EXERCISE_MAP] || 'compound movement';
  
  // Определяем локацию и оборудование
  const location = specialEquipment ? 'commercial gym' : 'home minimal setup';
  const equipmentList = getEquipmentList(workoutTypes, specialEquipment);
  
  // Создаем промпт в зависимости от типа изображения
  switch (imageType) {
    case 'hero':
      return buildHeroPrompt(gender, primaryWorkoutType, exerciseForMuscle, location, equipmentList);
    case 'technique':
      return buildTechniquePrompt(gender);
    case 'macro':
      return buildMacroPrompt();
    default:
      return buildHeroPrompt(gender, primaryWorkoutType, exerciseForMuscle, location, equipmentList);
  }
}

// Промпт для HERO/ACTION изображений (16:9)
function buildHeroPrompt(gender: string, workoutType: string, exercise: string, location: string, equipment: string): string {
  let prompt = `Professional fitness photography: A ${gender} person in athletic wear`;
  prompt += ` in a clean ${location} environment. `;
  prompt += `Equipment visible: ${equipment}. `;
  prompt += `Lighting: natural studio lighting, clean background. `;
  prompt += `Style: motivational fitness photography, natural poses. `;
  prompt += `No text, no logos, no watermarks. `;
  prompt += `Safe and appropriate content for all audiences.`;
  
  return prompt;
}

// Промпт для TECHNIQUE CARD изображений (4:3)
function buildTechniquePrompt(gender: string): string {
  let prompt = `Studio fitness photography: ${gender} person in athletic wear`;
  prompt += ` in a clean studio environment. `;
  prompt += `Background: neutral studio background with natural lighting. `;
  prompt += `Style: educational fitness photography, clear form demonstration. `;
  prompt += `No text, no logos, no watermarks. `;
  prompt += `Safe and appropriate content for all audiences.`;
  
  return prompt;
}

// Промпт для MACRO/DETAIL изображений (3:2)
function buildMacroPrompt(): string {
  let prompt = `Close-up fitness photography: fitness equipment in a clean setting`;
  prompt += ` with natural lighting and clean composition. `;
  prompt += `Style: detail photography, focus on equipment. `;
  prompt += `No text, no logos. `;
  prompt += `Safe and appropriate content for all audiences.`;
  
  return prompt;
}

// Получение списка оборудования на основе типа тренировки
function getEquipmentList(workoutTypes: string[], specialEquipment: boolean): string {
  const equipmentMap: { [key: string]: string } = {
    'HIIT': 'timer, resistance bands, bodyweight',
    'TRX': 'TRX straps, anchor point',
    'Calisthenics': 'pull-up bar, parallel bars, rings',
    'Full-Body Strength': 'dumbbells, barbell, weight plates',
    'Hypertrophy': 'dumbbells, barbell, cable machine',
    'Powerlifting Fundamentals': 'barbell, weight plates, power rack',
    'Kettlebell': 'kettlebells, open space',
    'Bands/Mini-bands': 'resistance bands, mini-bands, anchor points',
    'EMOM/AMRAP/Tabata': 'timer, minimal equipment',
    'Home Minimal': 'resistance bands, bodyweight, chair',
    'Commercial Gym': 'full gym equipment, machines, free weights',
    'Boxing Conditioning': 'punching bag, gloves, timer',
    'Plyometrics': 'open space, boxes, hurdles',
    'Mobility': 'yoga mat, foam roller, mobility tools'
  };
  
  if (workoutTypes.length > 0) {
    const primaryType = workoutTypes[0];
    return equipmentMap[primaryType] || 'basic fitness equipment';
  }
  
  return specialEquipment ? 'commercial gym equipment' : 'home minimal setup';
}

// Генерация совета по питанию
export async function generateNutritionAdvice(request: FitnessContentRequest): Promise<string> {
  try {
    const prompt = `Create personalized nutrition advice for a ${request.gender} person doing ${request.workoutTypes.join(', ')} workouts ${request.sessionsPerWeek} times per week. Include meal timing, protein requirements, hydration tips, and pre/post workout nutrition.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a certified nutritionist specializing in sports nutrition. Provide practical, evidence-based advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Failed to generate nutrition advice";
  } catch (error) {
    console.error('Error generating nutrition advice:', error);
    throw new Error('Failed to generate nutrition advice');
  }
}
