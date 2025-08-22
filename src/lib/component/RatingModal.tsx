import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { StyleGuide } from '../../../StyleGuide';
import AppButton from './AppButton';

const { width: screenWidth } = Dimensions.get('window');

interface RatingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => Promise<void>;
  driverName?: string;
  isLoading?: boolean;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  driverName = 'Driver',
  isLoading = false
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      // Show error or alert that rating is required
      return;
    }
    
    try {
      await onSubmit(rating, review);
      // Reset form only on success
      setRating(0);
      setReview('');
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error in RatingModal:', error);
    }
  };

  const renderStar = (starNumber: number) => {
    const isFilled = starNumber <= rating;
    const isHovered = starNumber <= hoveredRating;
    
    return (
      <TouchableOpacity
        key={starNumber}
        onPress={() => handleStarPress(starNumber)}
        onPressIn={() => setHoveredRating(starNumber)}
        onPressOut={() => setHoveredRating(0)}
        style={styles.starContainer}
      >
        <Text style={[
          styles.star,
          isFilled || isHovered ? styles.starFilled : styles.starEmpty
        ]}>
          {isFilled || isHovered ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Rate Your Ride</Text>
          <Text style={styles.subtitle}>How was your experience with {driverName}?</Text>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Tap to rate:</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(renderStar)}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </Text>
          )}
        </View>

        <View style={styles.reviewContainer}>
          <Text style={styles.reviewLabel}>Write a review (optional):</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience..."
            placeholderTextColor={StyleGuide.color.grey}
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
                  <AppButton
          title="Submit Rating"
          onPress={handleSubmit}
          disabled={rating === 0 || isLoading}
          loading={isLoading}
          style={rating === 0 || isLoading ? styles.submitButtonDisabled : styles.submitButton}
          textStyle={styles.submitButtonText}
        />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: StyleGuide.color.white,
    borderRadius: 20,
    padding: 24,
    width: screenWidth * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: StyleGuide.color.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: StyleGuide.color.grey,
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    color: StyleGuide.color.black,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starContainer: {
    padding: 8,
  },
  star: {
    fontSize: 40,
    color: StyleGuide.color.grey,
  },
  starFilled: {
    color: '#FFD700', // Gold color for filled stars
  },
  starEmpty: {
    color: StyleGuide.color.grey,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: StyleGuide.color.primary,
    marginTop: 8,
  },
  reviewContainer: {
    marginBottom: 24,
  },
  reviewLabel: {
    fontSize: 16,
    color: StyleGuide.color.black,
    marginBottom: 12,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: StyleGuide.color.lightGrey,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: StyleGuide.color.black,
    backgroundColor: StyleGuide.color.white,
    minHeight: 100,
  },
  buttonContainer: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: StyleGuide.color.primary,
    borderRadius: 12,
 
    padding:0
  },
  submitButtonDisabled: {
    backgroundColor: StyleGuide.color.lightGrey,
  },
  submitButtonText: {
    color: StyleGuide.color.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: StyleGuide.color.grey,
  },
});

export default RatingModal;
