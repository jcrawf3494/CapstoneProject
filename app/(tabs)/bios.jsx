import React, { useState, useRef } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, Modal, TextInput, StyleSheet, Animated 
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ScrollableList from './ScrollableListBios';
import NavigationDrawer from './NavigationDrawer';

const BiosPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current; // For sidebar animation
  const [showModal, setShowModal] = useState(false);

  const [profiles, setProfiles] = useState([
    { id: '1', name: 'John Doe', description: 'Pet: Buddy | ID: 12345 | 📧 john@example.com | 📞 555-1234' },
    { id: '2', name: 'Jane Smith', description: 'Pet: Milo | ID: 67890 | 📧 jane@example.com | 📞 555-5678' },
    { id: '3', name: 'John Doe', description: 'Pet: Buddy | ID: 12345 | 📧 john@example.com | 📞 555-1234' },
    { id: '4', name: 'Jane Smith', description: 'Pet: Milo | ID: 67890 | 📧 jane@example.com | 📞 555-5678' },
    { id: '5', name: 'John Doe', description: 'Pet: Buddy | ID: 12345 | 📧 john@example.com | 📞 555-1234' },
    { id: '6', name: 'Jane Smith', description: 'Pet: Milo | ID: 67890 | 📧 jane@example.com | 📞 555-5678' },
    { id: '7', name: 'John Doe', description: 'Pet: Buddy | ID: 12345 | 📧 john@example.com | 📞 555-1234' },
    { id: '8', name: 'Jane Smith', description: 'Pet: Milo | ID: 67890 | 📧 jane@example.com | 📞 555-5678' },
    { id: '9', name: 'John Doe', description: 'Pet: Buddy | ID: 12345 | 📧 john@example.com | 📞 555-1234' },
    { id: '10', name: 'Jane Smith', description: 'Pet: Milo | ID: 67890 | 📧 jane@example.com | 📞 555-5678' },
    { id: '11', name: 'John Doe', description: 'Pet: Buddy | ID: 12345 | 📧 john@example.com | 📞 555-1234' },
    { id: '12', name: 'Jane Smith', description: 'Pet: Milo | ID: 67890 | 📧 jane@example.com | 📞 555-5678' },
    { id: '13', name: 'John Doe', description: 'Pet: Buddy | ID: 12345 | 📧 john@example.com | 📞 555-1234' },
    { id: '14', name: 'Jane Smith', description: 'Pet: Milo | ID: 67890 | 📧 jane@example.com | 📞 555-5678' },
  ]);

  const [newProfile, setNewProfile] = useState({
    name: '',
    petName: '',
    petId: '',
    email: '',
    phone: '',
  });

  // Open & Close Sidebar
  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  // Add new profile
  const addNewProfile = () => {
    if (newProfile.name && newProfile.petName && newProfile.petId && newProfile.email && newProfile.phone && newProfile.preferredContactTime) {
      setProfiles([
        ...profiles, 
        { 
          id: String(profiles.length + 1), 
          name: newProfile.name, 
          description: `Pet: ${newProfile.petName} | ID: ${newProfile.petId} | 📧 ${newProfile.email} | 📞 ${newProfile.phone} | Contact Time: ${newProfile.preferredContactTime}` 
        }
      ]);
      setNewProfile({ name: '', petName: '', petId: '', email: '', phone: '', preferredContactTime: '' });
      setShowModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={toggleMenu}>
          <Icon name="bars" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Bios</Text>
        <TouchableOpacity>
          <Icon name="user" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sidebar Drawer */}
      <NavigationDrawer slideAnim={slideAnim} closeMenu={toggleMenu} />

      {/* Scrollable List with Profiles */}
      <View style={styles.listContainerBios}>
        <ScrollableList title="Profiles" data={profiles} />
      </View>

      {/* Add Profile Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal for Adding New Profile */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newProfile.name}
              onChangeText={(text) => setNewProfile({ ...newProfile, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Pet Name"
              value={newProfile.petName}
              onChangeText={(text) => setNewProfile({ ...newProfile, petName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Pet ID"
              value={newProfile.petId}
              onChangeText={(text) => setNewProfile({ ...newProfile, petId: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={newProfile.email}
              onChangeText={(text) => setNewProfile({ ...newProfile, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={newProfile.phone}
              onChangeText={(text) => setNewProfile({ ...newProfile, phone: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Time"
              keyboardType="phone-pad"
              value={newProfile.phone}
              onChangeText={(text) => setNewProfile({ ...newProfile, phone: text })}
            />
            <TouchableOpacity style={styles.saveButton} onPress={addNewProfile}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  navBar: {
    width: '100%',
    height: 60,
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  listContainerBios: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#333',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BiosPage;
