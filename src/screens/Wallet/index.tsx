import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { StyleGuide } from '../../../StyleGuide';
import Svg from '../../lib/svg';
import { download, logoSimple, rightArrowBlack, rightIcon } from '../../../assets/svgAssets';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: string;
  date: string;
  time: string;
  amount: string;
}

const Wallet: React.FC = () => {
  const transactions: Transaction[] = [
    { id: '1', date: 'DEC 20, 2024', time: '03:00 AM', amount: '10,000 QR' },
    { id: '2', date: 'DEC 20, 2024', time: '03:00 AM', amount: '10,000 QR' },
    { id: '3', date: 'DEC 20, 2024', time: '03:00 AM', amount: '10,000 QR' },
    { id: '4', date: 'DEC 20, 2024', time: '03:00 AM', amount: '10,000 QR' },
  ];

  const handleGoBack = () => {
    // Handle back navigation
    console.log('Go back');
  };

  const handleAddCredits = () => {
    // Handle add credits
    console.log('Add credits');
  };

  const handleDownloadInvoice = (id: string) => {
    // Handle invoice download
    console.log('Download invoice:', id);
  };
useScreenHeader({
    title:'Wallet'
})
const navigation=useNavigation()
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
     

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>2,50,000 QR</Text>
          
          <View style={styles.cardBottom}>
            <Text style={styles.cardNumber}>**** **** **** **</Text>
            <View style={styles.logoContainer}>
              <Svg xml={logoSimple} rest={{height:40,width:40}}/>
            </View>
          </View>
        </View>

        {/* Add Credits Button */}
        <TouchableOpacity style={styles.addCreditsButton} onPress={handleAddCredits}>
          <Text style={styles.addCreditsText}>+ Add Credits</Text>
        </TouchableOpacity>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
            <TouchableOpacity onPress={()=>navigation.navigate('transaction')} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <Svg xml={rightArrowBlack} rest={{height:18,width:18}}/>
            </TouchableOpacity>
         

          <View style={styles.divider} />
          <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
          
          <Text style={styles.invoicesTitle}>Invoices</Text>
          <Svg xml={rightArrowBlack} rest={{height:18,width:18}}/>
           
          </TouchableOpacity>
          {transactions.map((transaction) => (
            <TouchableOpacity onPress={()=>navigation.navigate('paymentReceipt')} key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDate}>
                  {transaction.date} | {transaction.time}
                </Text>
                <Text style={styles.transactionAmount}>{transaction.amount}</Text>
              </View>
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => handleDownloadInvoice(transaction.id)}
              >
              <Svg xml={download} rest={{height:20,width:20}}/>
                
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
   ...StyleGuide.layout.container
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    // paddingHorizontal: 16,
  },
  walletCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    marginBottom: 20,
  },
  balanceLabel: {
    fontFamily:StyleGuide.fontFamily.medium,
    color:StyleGuide.color.grey,
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.white,
    fontSize: 24,
    marginBottom: 40,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 2,
  },
  logoContainer: {
   
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addCreditsButton: {
    backgroundColor: '#e6d5b8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  addCreditsText: {
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.black,
    fontSize: 16,
  },
  transactionsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.black,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  invoicesTitle: {
    fontSize: 18,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.black,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor:StyleGuide.color.white,marginBottom:10,
    paddingHorizontal:10,
    borderRadius:20
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.grey,
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.primary,
  },
  downloadButton: {
    padding: 8,
  },
});

export default Wallet;