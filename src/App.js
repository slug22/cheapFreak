import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import data from './updated_data.json';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
`;



const CategoriesContainer = styled.div`
  width: 80%;
  max-width: 600px;
`;

const CategoryRow = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const CategoryTitle = styled.h2`
  margin-bottom: 10px;
`;

const ListingContainer = styled.div`
  position: relative;
  height: 120px;
  overflow: hidden;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ListingsWrapper = styled(motion.div)`
  display: flex;
  position: absolute;
  height: 100%;
`;

const Listing = styled(motion.div)`
  flex: 0 0 100%;
  height: 100%;
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Price = styled.p`
  font-weight: bold;
  font-size: 18px;
  margin-top: 10px;
`;



const MealCalculation = styled.div`
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  text-align: center;
`;



const ClickableContent = styled.a`
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
`;
const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#333' : '#ccc'};
  margin: 0 4px;
  transition: background-color 0.3s ease;
`;
const MealCalculationBox = styled.div`
  background-color: #4CAF50;
  color: white;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MealCount = styled.h2`
  font-size: 24px;
  margin: 0;
`;

const PricePerMeal = styled.p`
  font-size: 18px;
  margin: 10px 0 0;
`;const TopContainer = styled.div`
display: flex;
flex-direction: column;
align-items: center;
width: 100%;
max-width: 600px;
margin-bottom: 5px;
`;

const SearchContainer = styled.div`
display: flex;
width: 100%;
margin-bottom: 10px;
`;

const SearchBar = styled.input`
flex-grow: 1;
padding: 10px;
font-size: 16px;
border: 2px solid #ddd;
border-radius: 20px;
`;

const SearchButton = styled.button`
padding: 10px 20px;
font-size: 16px;
background-color: #4CAF50;
color: white;
border: none;
border-radius: 20px;
cursor: pointer;

&:hover {
  background-color: #45a049;
}
`;



const BudgetContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 5px;
  padding-right: 20px;
  font-weight: 800;
`;

const BudgetInput = styled.input`
  width: 80px; // Adjust this value to make it smaller or larger as needed
  padding: 10px;
  font-size: 15px;
  font-weight: 800;
  border: 2px solid #ddd;
  border-radius: 20px;
 
`;

const OptimizeButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;
const App = () => {
  const [activeIndices, setActiveIndices] = useState({ carbs: 0, protein: 0, produce: 0 });
  const [budget, setBudget] = useState('');
  const [mealCount, setMealCount] = useState(0);
  const [categories, setCategories] = useState({ carbs: [], protein: [], produce: [] });
  const [validCombinations, setValidCombinations] = useState([]);

  useEffect(() => {
    const fetchCategories = () => {
      try {
        // Filter out null items
        const filteredData = Object.fromEntries(
          Object.entries(data).map(([category, items]) => [
            category,
            items.filter(item => item.name !== null)
          ])
        );
        setCategories(filteredData);
      } catch (error) {
        console.error('Error processing data:', error);
      }
    };
  
    fetchCategories();
  }, []);

  const generateAllCombinations = useCallback(() => {
    const combinations = [];
    for (let i = 0; i < categories.carbs.length; i++) {
      for (let j = 0; j < categories.protein.length; j++) {
        for (let k = 0; k < categories.produce.length; k++) {
          const totalPrice = categories.carbs[i].price + categories.protein[j].price + categories.produce[k].price;
          const totalCalories = categories.carbs[i].calories + categories.protein[j].calories + categories.produce[k].calories;
          combinations.push({
            carbs: i,
            protein: j,
            produce: k,
            totalPrice,
            totalCalories,
            pricePerMeal: (totalPrice * 800) / totalCalories // Price per 800-calorie meal
          });
        }
      }
    }
    console.log(combinations)
    return combinations;
    
  }, [categories]);


  const filterCombinationsByBudget = useCallback((combinations, budgetAmount) => {
    return combinations.filter(combo => combo.totalPrice <= budgetAmount);
  }, []);


  useEffect(() => {
    if (categories.carbs.length && categories.protein.length && categories.produce.length) {
      const allCombinations = generateAllCombinations();
      if (budget) {
        const budgetAmount = parseFloat(budget);
        if (!isNaN(budgetAmount) && budgetAmount > 0) {
          const filteredCombinations = filterCombinationsByBudget(allCombinations, budgetAmount);
          setValidCombinations(filteredCombinations);
          
          // Check if current selection is still valid
          const currentCombo = {
            carbs: activeIndices.carbs,
            protein: activeIndices.protein,
            produce: activeIndices.produce
          };
          
          if (!filteredCombinations.some(combo => 
            combo.carbs === currentCombo.carbs &&
            combo.protein === currentCombo.protein &&
            combo.produce === currentCombo.produce
          )) {
            // If not valid, set to the first valid combination
            if (filteredCombinations.length > 0) {
              setActiveIndices(filteredCombinations[0]);
            }
          }
        } else {
          setValidCombinations(allCombinations);
        }
      } else {
        setValidCombinations(allCombinations);
      }
    }
  }, [categories, budget, generateAllCombinations, filterCombinationsByBudget]);

  const [dragOffset, setDragOffset] = useState({ carbs: 0, protein: 0, produce: 0 });


  
  const handleDragEnd = (category, event, info) => {    

    const validIndices = getValidIndices(category);
    const currentIndex = activeIndices[category];
    const currentIndexPosition = validIndices.indexOf(currentIndex);
  
    let newIndex;
  
    // If swiped right and not at the first item, move to the previous item
    if (info.offset.x > 0 && currentIndexPosition > 0) {
      newIndex = validIndices[currentIndexPosition - 1];
    } 
    // If swiped left and not at the last item, move to the next item
    else if (info.offset.x < 0 && currentIndexPosition < validIndices.length - 1) {
      newIndex = validIndices[currentIndexPosition + 1];
    } 
    // If at the edges or no significant swipe, stay at the current item
    else {
      newIndex = currentIndex;
    }
  
    const newIndices = { ...activeIndices, [category]: newIndex };
    setActiveIndices(newIndices);
    
    // Reset the dragOffset for the category to the new position
    setDragOffset(prev => ({
      ...prev,
      [category]: -newIndex * 100
    }));
  };
  const calculateMeals = useCallback(() => {
    const budgetAmount = parseFloat(budget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      setMealCount(0);
      return;
    }

    const currentCombo = validCombinations.find(combo => 
      combo.carbs === activeIndices.carbs &&
      combo.protein === activeIndices.protein &&
      combo.produce === activeIndices.produce
    );

    if (!currentCombo) {
      setMealCount(0);
      return;
    }

    const mealSets = budgetAmount / currentCombo.totalPrice;
    const totalCalories = currentCombo.totalCalories * mealSets;
    const totalMeals = totalCalories / 800;

    setMealCount(totalMeals);
  }, [budget, validCombinations, activeIndices]);

  useEffect(() => {
    calculateMeals();
  }, [budget, activeIndices, calculateMeals]);

  const slideVariants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0
      };
    }
  };
  const handleDrag = (category, event, info) => {
    const dragPercentage = (info.point.x / event.target.offsetWidth) * 100;
    setDragOffset(prev => ({
      ...prev,
      [category]: dragPercentage
    }));
  };
  const optimizeMeals = () => {
    const budgetAmount = parseFloat(budget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) return;

    const affordableCombinations = validCombinations.filter(combo => combo.totalPrice <= budgetAmount);
    if (affordableCombinations.length === 0) return;

    const optimalCombo = affordableCombinations.reduce((best, current) => 
      current.pricePerMeal < best.pricePerMeal ? current : best
    );

    setActiveIndices({
      carbs: optimalCombo.carbs,
      protein: optimalCombo.protein,
      produce: optimalCombo.produce
    });
  };
  const getValidIndices = (category) => {
    const otherCategories = Object.keys(categories).filter(cat => cat !== category);
    const validIndices = new Set();
  
    validCombinations.forEach(combo => {
      if (otherCategories.every(otherCat => combo[otherCat] === activeIndices[otherCat])) {
        validIndices.add(combo[category]);
      }
    });
  
    return Array.from(validIndices).sort((a, b) => a - b);
  };
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (category) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const validIndices = getValidIndices(category);
    const currentIndex = validIndices.indexOf(activeIndices[category]);

    let newIndex = currentIndex;
    if (distance > 50 && currentIndex < validIndices.length - 1) {
      newIndex = currentIndex + 1;
    } else if (distance < -50 && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    setActiveIndices(prev => ({ ...prev, [category]: validIndices[newIndex] }));
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <AppContainer>
      <TopContainer>
 
=
  
  <BudgetContainer>
    $
    <BudgetInput
      type="number"
      placeholder="Budget"
      value={budget}
      onChange={(e) => setBudget(e.target.value)}
    />
    <OptimizeButton onClick={optimizeMeals}>Optimize</OptimizeButton>
  </BudgetContainer>
</TopContainer>


        <CategoriesContainer>
        {Object.entries(categories).map(([category, items]) => {
          const validIndices = getValidIndices(category);
          const activeIndex = validIndices.indexOf(activeIndices[category]);
          
          return (
            <CategoryRow key={category}>
              <CategoryTitle>{category.charAt(0).toUpperCase() + category.slice(1)}</CategoryTitle>
              <ListingContainer>
                <ListingsWrapper
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(category)}
                  animate={{ x: -activeIndex * 100 + '%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {items.filter((_, index) => validIndices.includes(index)).map((item) => (
                    <Listing key={item.id}>
                      <ClickableContent 
                        href={item.product_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3>{item.name}</h3>
                        <Price>${item.price?.toFixed(2)}</Price>
                      </ClickableContent>
                    </Listing>
                  ))}
                </ListingsWrapper>
              </ListingContainer>
              <DotsContainer>
                {validIndices.map((index) => (
                  <Dot key={index} active={index === activeIndices[category]} />
                ))}
              </DotsContainer>
            </CategoryRow>
          );
        })}
      </CategoriesContainer>
      <MealCalculationBox>
  <MealCount>{Math.floor(mealCount)} meals</MealCount>
  <PricePerMeal>
    ${mealCount > 0 ? (parseFloat(budget) / mealCount).toFixed(2) : '0'}/meal
  </PricePerMeal>
</MealCalculationBox>
    </AppContainer>
  );
};

export default App;