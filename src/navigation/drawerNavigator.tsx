import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerItemList 
} from '@react-navigation/drawer';
// import { Ionicons } from '@expo/vector-icons';
import BottomTabs from './bottomTabsNavigator';
import Activities from '../screens/Activities/activities';
import Wallet from '../screens/Wallet';
import { StyleGuide } from '../../StyleGuide';
import { screenWidth } from '../utils/dimenstions';
import Svg from '../lib/svg';
import { Cash, CashInactive, homeActive, homeInactive, logout } from '../../assets/svgAssets';
import ChatSupport from '../screens/chatSupport';

const Drawer = createDrawerNavigator();

const logo=require('../../assets/images/logo.png')
const profile=require('../../assets/images/manBg.png')
// Custom Drawer Content Component
const CustomDrawerContent = (props) => {
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            // Close the drawer
            props.navigation.closeDrawer();
  
            // Add your logout logic here
            // For example: clear AsyncStorage, reset navigation, etc.
            console.log("User logged out");
            
            // Reset navigation to the Login screen
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'login' }],
            });
          }
        }
      ]
    );
  };
  
  return (
    <View style={styles.drawerContainer}>
      {/* Header Section with Logo */}
      <View style={styles.headerSection}>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={profile}
          style={styles.userImage}
           resizeMode="center"
        />
        <View style={styles.userInfo}>
          <Text numberOfLines={1} style={styles.userName}>Usman Virk</Text>
          <Text numberOfLines={1} style={styles.userEmail}>Usman.Virk@example.com</Text>
        </View>
      </View>

      {/* Drawer Items */}
      <DrawerContentScrollView {...props} style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
                    <Svg xml={logout} rest={{height:20,width:20,style:{marginRight: 15}}}/>

          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      drawerStyle: {
        width: screenWidth*0.68,
      },
      drawerItemStyle:{
        borderRadius:10
      },
      drawerLabelStyle: {
        fontSize:16,
        fontFamily:StyleGuide.fontFamily.bold,
        // color:StyleGuide.color.black,
      },
      drawerActiveTintColor: StyleGuide.color.primary,
      drawerInactiveTintColor: '#666',
    }}
  >
    <Drawer.Screen 
      name="Home" 
      component={BottomTabs}
      options={{
        headerShown: false,
        drawerIcon: ({ color, size,focused }) => (
          <Svg xml={focused?homeActive:homeInactive} rest={{height:20,width:20,marginRight: 15}}/>
        ),
      }}
    />
    <Drawer.Screen 
      name="Wallet" 
      component={Wallet}
      options={{
        drawerIcon: ({ color, size,focused }) => (
          <Svg xml={focused?Cash:CashInactive} rest={{height:20,width:20,marginRight: 15}}/>

        ),
      }}
    />
     <Drawer.Screen 
      name="Chat" 
      component={ChatSupport}
      options={{
        headerShown: false,
        drawerIcon: ({ color, size,focused }) => (
          <Svg xml={focused?Cash:CashInactive} rest={{height:20,width:20,marginRight: 15}}/>

        ),
      }}
    />
  
  </Drawer.Navigator>
);

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: StyleGuide.color.backgroundColor,
    borderBottomRightRadius:20,
    borderTopRightRadius:20
  },
  headerSection: {
    marginTop:50,
    alignItems: 'center',
  
  },
  logo: {
    width: '100%',
    height: 60,
    marginBottom: 20,
    borderRadius: 100,
  },
 
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
   paddingHorizontal:10,
   paddingVertical:10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    // backgroundColor: '#f8f9fa',
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    backgroundColor:StyleGuide.color.grey
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
   fontFamily:StyleGuide.fontFamily.bold,
   color:StyleGuide.color.black,
    // marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    fontFamily:StyleGuide.fontFamily.regular,
    color:StyleGuide.color.grey,
  },
  drawerItems: {
    flex: 1,
    marginTop: 10,
  },
  logoutSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4757',
    marginLeft: 15,
    fontFamily:StyleGuide.fontFamily.semiBold
  },
});

export default DrawerNavigator;