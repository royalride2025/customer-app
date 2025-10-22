import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { launchImageLibrary, launchCamera, MediaType } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import networkClient from "../../../networkClient";
import { StyleGuide } from "../../../StyleGuide";
import { screenHeight, screenWidth } from "../../utils/dimenstions";
import DatePicker from "react-native-date-picker";
import { API_ENDPOINTS } from "../../../apiEndpoints";
import moment from "moment";
import Svg from "../../lib/svg";
import { lock, eye, eyeOff, cross } from "../../../assets/svgAssets";
import { useAppSelector } from "../../redux/reduxHooks";
import { RootState } from "../../redux/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScreenHeader } from "../../lib/hooks/useScreenHeader";
import { useNavigation } from '@react-navigation/native';
import { shouldShowVerificationPrompt } from '../../utils/verificationUtils';

export default function UserProfile() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male"); // Set Male as default
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // Server image URL
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false); // Password modal state
  const [password, setPassword] = useState(""); // For password update
  const [newPassword, setNewPassword] = useState(""); // New password input
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password input
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false); // Password update loading state

  const profileData = useAppSelector((state: RootState) => state.profile.data);
  const authUser = useAppSelector((state: RootState) => state.auth.user);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  // Keyboard event handlers
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Keyboard is shown
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Scroll back to top when keyboard closes
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  console.log(profileData,"profileData====")
  // Fetch user profile data from Redux store
  useEffect(() => {
    if (profileData) {
      // Extract data from the profile structure - handle both possible structures
      const profile = profileData.profile as any; // Type assertion for flexibility
      const userData = profileData.user;
      
              // Check if it's the customer_profile structure
        if (profile?.customer_profile) {
          const customerProfile = profile.customer_profile;
          setName(customerProfile.name || "");
          setDob(customerProfile.dob ? moment(customerProfile.dob).format("YYYY-MM-DD") : "");
          setAddress(customerProfile.location || "");
          setGender("Male"); // Default to Male as per requirement
          
          // Handle image with validation
          const profileImg = customerProfile.profile_img;
          if (profileImg && 
              profileImg !== '' && 
              profileImg !== 'null' && 
              profileImg !== 'undefined' &&
              typeof profileImg === 'string' &&
              profileImg.trim() !== '') {
            setImageUrl(profileImg);
            setImageUri(profileImg);
          } else {
            setImageUrl(null);
            setImageUri(null);
          }
        } else {
          // Fallback to direct profile structure
          setName(profile?.name || "");
          setDob(profile?.dob ? moment(profile.dob).format("YYYY-MM-DD") : "");
          setAddress(profile?.address || "");
          setGender("Male"); // Default to Male as per requirement
          
          // Handle image with validation
          const profileImg = profile?.driver_img || profile?.profile_img;
          if (profileImg && 
              profileImg !== '' && 
              profileImg !== 'null' && 
              profileImg !== 'undefined' &&
              typeof profileImg === 'string' &&
              profileImg.trim() !== '') {
            setImageUrl(profileImg);
            setImageUri(profileImg);
          } else {
            setImageUrl(null);
            setImageUri(null);
          }
        }
      
      // Set email if available (handle as any for flexibility)
      const user = userData as any;
      if (user?.email) {
        console.log("User email:", user.email);
      }
    }
  }, [profileData]);

  // Helper to request image picker permissions on Android
  const requestImagePickerPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      let permissions = [PermissionsAndroid.PERMISSIONS.CAMERA];
      if (Platform.Version >= 33 && PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      } else {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      console.log('Permission request results:', granted);

      for (const [key, value] of Object.entries(granted)) {
        if (value === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Toast.show({
            type: 'error',
            text1: 'Permission Required',
            text2: 'Please enable permissions from app settings.',
          });
          return false;
        }
      }
      return Object.values(granted).every(val => val === PermissionsAndroid.RESULTS.GRANTED);
    } catch (err) {
      console.log('Permission request error:', err);
      return false;
    }
  };

  const uploadImageToServer = async (asset: any) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || 'profile.jpg',
      });

      const response = await networkClient.post(API_ENDPOINTS.uploadImageToServer, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('File upload response:', response.data);
      return response.data;
    } catch (uploadError) {
      console.log('Upload error:', (uploadError as any)?.message);
      throw new Error((uploadError as any)?.message || 'Could not upload file.');
    }
  };

  const pickFile = async (useCamera = false) => {
    setUploading(true);

    const hasPermission = await requestImagePickerPermissions();
    if (!hasPermission) {
      setUploading(false);
      Toast.show({
        type: 'error',
        text1: 'Permission Required',
        text2: 'Please grant photo and camera permissions to pick a file.',
      });
      return;
    }

    try {
      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.7 as any,
      };

      const launcher = useCamera ? launchCamera : launchImageLibrary;
      launcher(options, async (response) => {
        if (response.didCancel) {
          setUploading(false);
          return;
        }

        if (response.errorMessage) {
          setUploading(false);
          Toast.show({ type: 'error', text1: 'Error', text2: response.errorMessage });
          return;
        }

        const asset = response.assets && response.assets[0];
        if (!asset) {
          setUploading(false);
          return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!asset.type || !allowedTypes.includes(asset.type)) {
          setUploading(false);
          Toast.show({ type: 'error', text1: 'Invalid File', text2: 'Only JPG and PNG files are allowed.' });
          return;
        }

        if (asset.fileSize != null && asset.fileSize > 5 * 1024 * 1024) {
          setUploading(false);
          Toast.show({ type: 'error', text1: 'File Too Large', text2: 'Please select a file smaller than 5MB.' });
          return;
        }

        setImageUri(asset.uri || null);

        try {
          const uploadResult = await uploadImageToServer(asset);
          setImageUrl(uploadResult.url);
          Toast.show({ type: 'success', text1: 'Success', text2: 'Profile photo uploaded successfully!' });
        } catch (uploadError) {
          Toast.show({ type: 'error', text1: 'Upload Failed', text2: (uploadError as any).message });
          setImageUri(null);
        } finally {
          setUploading(false);
        }
      });
    } catch (err) {
      setUploading(false);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not pick file.' });
    }
  };

  const pickImage = useCallback(() => pickFile(false), []);
  const takePhoto = useCallback(() => pickFile(true), []);
  
  const handleContactSupport = useCallback(() => {
    Alert.alert(
      'Contact Support',
      'Please contact our support team for assistance with your suspended account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email Support', 
          onPress: () => {
            // You can add email support logic here
            // For now, just show a message
            Toast.show({
              type: 'info',
              text1: 'Support',
              text2: 'Please email support@royalride.com',
              position: 'top',
              visibilityTime: 4000,
            });
          }
        }
      ]
    );
  }, []);

  const handleVerifyPhone = useCallback(() => {
    if (authUser?.phone) {
      (navigation as any).navigate('verifyOtp', { 
        phone: authUser.phone,
        isFromSignup: false 
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Phone number not found. Please contact support.',
      });
    }
  }, [authUser?.phone, navigation]);

  const validate = () => {
    if (!name.trim()) return "Please enter your name.";
    if (!address.trim()) return "Please enter your address.";
    if (!dob.trim()) return "Please enter your date of birth (YYYY-MM-DD).";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      return "DOB must be in YYYY-MM-DD format.";
    }

    const dateObj = new Date(dob.trim());
    const today = new Date();
    if (isNaN(dateObj.getTime()) || dateObj > today) {
      return "Please enter a valid date of birth.";
    }

    return null;
  };

  const onSave = useCallback(async () => {
    const err = validate();
    if (err) {
      Alert.alert("Invalid input", err);
      return;
    }

    setSaving(true);

    try {
      // Get current profile data from Redux
      const profile = profileData?.profile as any;
      const currentProfile = profile?.customer_profile;
      
              // Create payload with all required fields
        const payload: any = {
          name: name.trim(),
          dob: dob.trim(),
          address: address.trim(),
          profile_img: imageUrl,
          gender: gender
        };
  
        console.log('Profile update payload:', payload);
        
        // Use relative path instead of full URL
        const response = await networkClient.put(API_ENDPOINTS.UPDATE_PROFILE, payload);
        console.log('Profile update response:', response);
      Toast.show({ type: 'success', text1: 'Success', text2: response?.data?.message  });
    } catch (error) {
      console.log('Save profile error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: (error as any)?.message || 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [name, address, dob, gender, imageUrl, profileData]);

  const showImageOptions = () => {
    Alert.alert(
      "Select Photo",
      "Choose how you'd like to add your profile photo:",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Photo Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" }
      ],
      { cancelable: true }
    );
  };

  const togglePasswordModal = () => {
    setPasswordModalVisible(!passwordModalVisible);
  };

  const updatePassword = async () => {
    if (!password || !newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all password fields.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'New password and confirm password do not match.',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'New password must be at least 6 characters long.',
      });
      return;
    }

    setUpdatingPassword(true);

    try {
      const response = await networkClient.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        oldPassword: password,
        newPassword: newPassword,
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password updated successfully!',
      });
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      togglePasswordModal();
    } catch (error) {
      console.log('Error updating password:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (error as any)?.message || 'Failed to update password.',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const isLoading = uploading || saving;
  useScreenHeader({
    title: "Edit Profile",
    showBackButton: true,
  });

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:0,}} ref={scrollViewRef}>
      {/* <Text style={styles.header}>Edit Profile</Text> */}

      {/* Account Status Indicator */}
      {profileData?.user?.status && profileData.user.status === 'inactive' && (
       
          <View style={{ backgroundColor: '#e53a3a', padding: 10, borderRadius: 8,position:'absolute',top:0,width:'100%',zIndex:1000}}>
              <Text style={{marginBottom:5,color: StyleGuide.color.white,fontFamily:StyleGuide.fontFamily.semiBold }}>⚠️ Alert</Text>

            <Text style={{  fontSize: 14, color: StyleGuide.color.white,fontFamily:StyleGuide.fontFamily.medium }}>Your account has been suspended. Please contact support for assistance.</Text>
          </View>
        
      )}

      {/* Phone Verification Status */}
      {profileData?.user && shouldShowVerificationPrompt(profileData.user) && (
        <View style={styles.verificationIndicator}>
          <View style={styles.verificationContent}>
            <Text style={styles.verificationTitle}>📱 Phone Verification Required</Text>
            <Text style={styles.verificationMessage}>
              Your phone number is not verified. Please verify your phone number to access all features.
            </Text>
            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handleVerifyPhone}
            >
              <Text style={styles.verifyButtonText}>Verify Phone Number</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={[styles.avatar, uploading && styles.avatarLoading]}
          onPress={showImageOptions}
          disabled={isLoading}
          accessibilityLabel="Profile photo"
          accessibilityHint="Tap to change profile photo"
        >
          {(() => {
            // Check if there's a valid image to display
            const hasValidImage = imageUri || imageUrl;
            
            if (hasValidImage) {
              // Use imageUri for newly selected images, fallback to imageUrl for server images
              const imageSource = imageUri || imageUrl;
              return (
                <>
                  <Image 
                    source={{ uri: imageSource! }} 
                    style={styles.avatarImage}
                    onError={() => {
                      // If image fails to load, reset the image state
                      setImageUri(null);
                      setImageUrl(null);
                    }}
                  />
                  {uploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="small" color={StyleGuide.color.primary} />
                    </View>
                  )}
                </>
              );
            } else {
              return (
                <View style={styles.avatarPlaceholder}>
                  {name ? (
                    <Text style={styles.avatarInitials}>
                      {name.split(' ').slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase()}
                    </Text>
                  ) : (
                    <>
                      <Text style={styles.avatarPlaceholderText}>📷</Text>
                      <Text style={styles.avatarPlaceholderSubtext}>Add Photo</Text>
                    </>
                  )}
                </View>
              );
            }
          })()}
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <View style={styles.field}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={StyleGuide.color.grey}
            style={styles.input}
            returnKeyType="next"
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date of Birth *</Text>
          <TouchableOpacity
            style={[styles.input]}
            onPress={() => setShowDobPicker(true)}
          >
            <Text style={[
              styles.inputValue,
              !dob && styles.placeholderText
            ]}>
              {dob ? dob : "Select Date of Birth"}
            </Text>
          </TouchableOpacity>

          <DatePicker
            modal
            open={showDobPicker}
            date={dob ? new Date(dob) : new Date(2000, 0, 1)}
            mode="date"
            maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 21))}
            onConfirm={(date) => {
              setShowDobPicker(false);
              setDob(moment(date).format("YYYY-MM-DD"));
            }}
            onCancel={() => setShowDobPicker(false)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
  value={address}
  onChangeText={setAddress}
  placeholder="Enter your address"
  placeholderTextColor={StyleGuide.color.grey}
  style={[styles.input, styles.multilineInput]}
  multiline
  numberOfLines={3}
  returnKeyType="done"
  autoCapitalize="sentences"
  editable={!isLoading}
  onSubmitEditing={() => {
    Keyboard.dismiss();
  }}
  blurOnSubmit={true}
  enablesReturnKeyAutomatically={true} // Only enable return key when there's text
/>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.radioButtons}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                gender === 'Male' && styles.radioButtonSelected
              ]}
              onPress={() => setGender('Male')}
            >
              <View style={[
                styles.radioCircle,
                gender === 'Male' && styles.radioCircleSelected
              ]}>
                {gender === 'Male' && <View style={styles.radioCircleInner} />}
              </View>
              <Text style={[
                styles.radioText,
                gender === 'Male' && styles.radioTextSelected
              ]}>Male</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.radioButton,
                gender === 'Female' && styles.radioButtonSelected
              ]}
              onPress={() => setGender('Female')}
            >
              <View style={[
                styles.radioCircle,
                gender === 'Female' && styles.radioCircleSelected
              ]}>
                {gender === 'Female' && <View style={styles.radioCircleInner} />}
              </View>
              <Text style={[
                styles.radioText,
                gender === 'Female' && styles.radioTextSelected
              ]}>Female</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.spacer} />
        </View>

       

        <Modal
  visible={passwordModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={togglePasswordModal}
>
  <TouchableWithoutFeedback onPress={togglePasswordModal}>
    <View style={styles.modalBackground}>
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Password</Text>
                <TouchableOpacity 
                  onPress={togglePasswordModal}
                  style={styles.closeButton}
                  disabled={updatingPassword}
                >
                 <Svg xml={cross} rest={{ height: 14, width: 14 }} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>Current Password</Text>
                <View style={styles.inputPasswordContainer}>
                  {/* <Svg xml={lock} rest={{ height: 20, width: 20, style: { marginRight: 8, alignSelf: 'center' } }} /> */}
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter current password"
                    style={styles.passwordInput}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#999"
                    editable={!updatingPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)} 
                    style={{ alignSelf: 'center', marginLeft: 8 }}
                    disabled={updatingPassword}
                  >
                    <Svg xml={showPassword ? eyeOff : eye} rest={{ height: 20, width: 20 }} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>New Password</Text>
                <View style={styles.inputPasswordContainer}>
                  {/* <Svg xml={lock} rest={{ height: 20, width: 20, style: { marginRight: 8, alignSelf: 'center' } }} /> */}
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    style={styles.passwordInput}
                    secureTextEntry={!showNewPassword}
                    placeholderTextColor="#999"
                    editable={!updatingPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowNewPassword(!showNewPassword)} 
                    style={{ alignSelf: 'center', marginLeft: 8 }}
                    disabled={updatingPassword}
                  >
                    <Svg xml={showNewPassword ? eyeOff : eye} rest={{ height: 20, width: 20 }} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>Confirm New Password</Text>
                <View style={styles.inputPasswordContainer}>
                  {/* <Svg xml={lock} rest={{ height: 20, width: 20, style: { marginRight: 8, alignSelf: 'center' } }} /> */}
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    style={styles.passwordInput}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#999"
                    editable={!updatingPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                    style={{ alignSelf: 'center', marginLeft: 8 }}
                    disabled={updatingPassword}
                  >
                    <Svg xml={showConfirmPassword ? eyeOff : eye} rest={{ height: 20, width: 20 }} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={updatePassword}
                style={[styles.modalButton, updatingPassword && styles.disabledButton]}
                disabled={updatingPassword}
              >
                {updatingPassword ? (
                  <View style={styles.buttonLoadingContainer}>
                    <ActivityIndicator size="small" color={StyleGuide.color.white} />
                    <Text style={[styles.modalButtonText, styles.buttonLoadingText]}>
                      Updating...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.modalButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>
      </View>

     

      <View style={styles.spacer} />
    </ScrollView>
   
    <View style={{marginBottom:40}} >
    <TouchableOpacity
          onPress={togglePasswordModal}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.disabledButton,{marginTop:30}]}
          onPress={onSave}
          disabled={isLoading}
          accessibilityLabel={saving ? "Saving profile" : "Save profile"}
        >
          {saving ? (
            <View style={styles.buttonLoadingContainer}>
              <ActivityIndicator size="small" color={StyleGuide.color.white} />
              <Text style={[styles.primaryButtonText, styles.buttonLoadingText]}>
                Saving...
              </Text>
            </View>
          ) : (
            <Text style={styles.primaryButtonText}>
              {uploading ? "Uploading Image..." : "Save Profile"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleGuide.layout.container,
    paddingBottom:0
   
  },
  statusIndicator: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    // marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
   position:"absolute",
   top:0,
   left:0,
   right:0,
   zIndex:1000,
  
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEAA7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: '#856404',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.regular,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 12,
  },
  contactSupportButton: {
    backgroundColor: '#856404',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  contactSupportButtonText: {
    color: '#FFF3CD',
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.medium,
  },
  header: {
    fontSize: 28,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.heading,
    marginBottom: 24,
    textAlign: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: StyleGuide.color.white,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: StyleGuide.color.border,
    position: "relative",
  },
  avatarLoading: {
    opacity: 0.7,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: 32,
    marginBottom: 4,
  },
  avatarPlaceholderSubtext: {
    color: StyleGuide.color.grey,
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.medium,
  },
  avatarInitials: {
    fontSize: 36,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.primary,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: StyleGuide.color.heading,
    fontFamily: StyleGuide.fontFamily.semiBold,
    fontSize: 16,
  },
  input: {
    backgroundColor: StyleGuide.color.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: StyleGuide.color.border,
    fontSize: 16,
    color: StyleGuide.color.blackishGrey,
    fontFamily: StyleGuide.fontFamily.regular,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  inputValue: {
    fontSize: 16,
    color: StyleGuide.color.blackishGrey,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  placeholderText: {
    color: StyleGuide.color.lightGrey,
  },
  radioButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: StyleGuide.color.white,
    borderWidth: 1,
    borderColor: StyleGuide.color.border,
    minWidth: 100,
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: StyleGuide.color.primary,
    backgroundColor: StyleGuide.color.light,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: StyleGuide.color.lightGrey,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: StyleGuide.color.primary,
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: StyleGuide.color.primary,
  },
  radioText: {
    fontSize: 16,
    color: StyleGuide.color.blackishGrey,
    fontFamily: StyleGuide.fontFamily.medium,
  },
  radioTextSelected: {
    color: StyleGuide.color.heading,
    fontFamily: StyleGuide.fontFamily.semiBold,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: StyleGuide.color.primary,
  },
  secondaryButtonText: {
    color: StyleGuide.color.primary,
    fontFamily: StyleGuide.fontFamily.semiBold,
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: StyleGuide.color.white,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: screenWidth,
    maxHeight: screenHeight * 0.7,
  },
  modalContent: {
    alignItems: "stretch",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: StyleGuide.color.primary,
    marginHorizontal: -20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.white,
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
   

    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: StyleGuide.color.primary,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  passwordField: {
    marginBottom: 16,
  },
  passwordLabel: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.heading,
    marginBottom: 8,
  },
  inputPasswordContainer: {
    flexDirection: 'row',
    backgroundColor: StyleGuide.color.white,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: StyleGuide.color.border,
    minHeight: screenHeight * 0.07,
  },
  passwordInput: {
    flex: 1,
    fontSize: screenWidth * 0.03,
    color: '#858586',
    paddingVertical: 16,
    fontFamily: StyleGuide.fontFamily.medium,
  },

  modalButton: {
    backgroundColor: StyleGuide.color.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  modalButtonText: {
    color: StyleGuide.color.white,
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 18,
  },
  stickyButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
   
  },
  primaryButton: {
    backgroundColor: StyleGuide.color.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    shadowColor: StyleGuide.color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: StyleGuide.color.white,
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLoadingText: {
    marginLeft: 8,
  },
  spacer: {
    height: 40,
  },
  verificationIndicator: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 20,
    marginTop: 20,
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: '#856404',
    marginBottom: 4,
  },
  verificationMessage: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.regular,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: '#856404',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  verifyButtonText: {
    color: '#FFF3CD',
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.medium,
  },
});
