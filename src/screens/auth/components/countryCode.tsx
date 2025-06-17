import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import Svg from '../../../lib/svg';
import { backIcon, check, facebook } from '../../../../assets/svgAssets';
import { StyleGuide } from '../../../../StyleGuide';
import { countries } from '../../../constant/countries';

// Define the type for the country data
interface Country {
  name: string;
  code: string;
  flag: string;
  id: string;
}

interface CountryCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCountry: (country: Country) => void;
  selectedCountry: Country | null;
}

const { width: screenWidth } = Dimensions.get('window');




const CountryCodeModal: React.FC<CountryCodeModalProps> = ({ 
  visible, 
  onClose, 
  onSelectCountry, 
  selectedCountry 
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter countries based on search query
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  );

  const handleCountrySelect = (country: Country) => {
    onSelectCountry(country);
    setSearchQuery('');
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        selectedCountry?.id === item.id && styles.selectedCountryItem
      ]}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.countryItemFlag}>{item.flag}</Text>
      <View style={styles.countryItemInfo}>
        <Text style={styles.countryItemName}>{item.name}</Text>
        <Text style={styles.countryItemCode}>{item.code}</Text>
      </View>
      {selectedCountry?.id === item.id && (
         <Svg xml={check} rest={{ height: 24, width: 24 }} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          {/* Close Icon */}
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Svg xml={backIcon} rest={{ height: 24, width: 24 }} /> 
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Country</Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search country or code"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>

        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={renderCountryItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: '600',
    color: StyleGuide.color.black,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: '#333',
    paddingVertical: 16,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  selectedCountryItem: {
    backgroundColor: '#f9f7f4',
  },
  countryItemFlag: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    marginRight: 16,
  },
  countryItemInfo: {
    flex: 1,
  },
  countryItemName: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  countryItemCode: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 72,
  },
});

export default CountryCodeModal;
