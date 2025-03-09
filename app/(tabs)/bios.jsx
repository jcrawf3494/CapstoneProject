import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, Modal, TextInput, StyleSheet, Animated, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NavigationDrawer from './NavigationDrawer';

const BiosPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current; // Sidebar animation
  const [showModal, setShowModal] = useState(false);

  const API_URL = "http://localhost:8080/api/fosters"; // Backend API

  const [profiles, setProfiles] = useState([]);

  // Fetch profiles from API
  const fetchProfiles = async () => {
    try {
        console.log("Fetching profiles from:", API_URL);
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        console.log("Response Status:", response.status);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Response Data:", data);
        setProfiles(data); // Store in state
    } catch (error) {
        console.error("Error fetching profiles:", error);
    }
  };

  // Load profiles on component mount
  useEffect(() => {
      fetchProfiles();
  }, []);

  const [newProfile, setNewProfile] = useState({
    name: '',
    phone_number: '',
    email: '',
    pet_name: '',
    preferred_contact_time: '',
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

  // Add new foster/pet profile
  const addNewProfile = async () => {
    if (Object.values(newProfile).some((val) => val.trim() === "")) {
        console.error("All fields are required.");
        return;
    }

    try {
        console.log("Adding new profile:", newProfile);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProfile),
        });

        console.log("Response Status:", response.status);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to add profile: ${JSON.stringify(errorData)}`);
        }

        console.log("Profile added successfully!");
        fetchProfiles(); // Refresh profiles
        setShowModal(false);
        setNewProfile({ name: "", phone_number: "", email: "", pet_name: "", preferred_contact_time: "" });
    } catch (error) {
        console.error("Error adding profile:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={toggleMenu}>
          <Icon name="bars" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Fosters</Text>
        <TouchableOpacity>
          <Icon name="user" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sidebar Drawer */}
      <NavigationDrawer slideAnim={slideAnim} closeMenu={toggleMenu} />

      {/* Foster & Pet List */}
      <ScrollView style={styles.listContainerBios}>
        {profiles.length > 0 ? (
          profiles.map((profile, index) => (
            <View key={index} style={styles.profileCard}>
              <Text style={styles.profileTitle}>{profile.name}</Text>
              <Text>Email: {profile.email}</Text>
              <Text>Phone: {profile.phone_number}</Text>
              <Text>Pet Name: {profile.pet_name}</Text>
              <Text>Preferred Contact Time: {profile.preferred_contact_time}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No profiles found.</Text>
        )}
      </ScrollView>

      {/* Add Profile Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal for Adding New Profile */}
      <Modal transparent={true} animationType="slide" visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Foster/Pet</Text>
            <TextInput style={styles.input} placeholder="Name" value={newProfile.name} onChangeText={(text) => setNewProfile({ ...newProfile, name: text })} />
            <TextInput style={styles.input} placeholder="Pet Name" value={newProfile.pet_name} onChangeText={(text) => setNewProfile({ ...newProfile, pet_name: text })} />
            <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={newProfile.email} onChangeText={(text) => setNewProfile({ ...newProfile, email: text })} />
            <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" value={newProfile.phone_number} onChangeText={(text) => setNewProfile({ ...newProfile, phone_number: text })} />
            <TextInput style={styles.input} placeholder="Preferred Contact Time" value={newProfile.preferred_contact_time} onChangeText={(text) => setNewProfile({ ...newProfile, preferred_contact_time: text })} />
            <TouchableOpacity style={styles.saveButton} onPress={addNewProfile}><Text style={styles.saveButtonText}>Save</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BiosPage;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f8f8' },
  navBar: { width: '100%', height: 60, backgroundColor: '#333', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  navTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  listContainerBios: { flex: 1, padding: 10 },
  profileCard: { backgroundColor: 'white', padding: 15, marginVertical: 5, borderRadius: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  profileTitle: { fontWeight: 'bold', fontSize: 16 },
  noDataText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  addButton: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#333', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
  saveButton: { backgroundColor: 'green', padding: 10, borderRadius: 5, marginTop: 10 },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  cancelButton: { backgroundColor: 'red', padding: 10, borderRadius: 5, marginTop: 10 },
  cancelButtonText: { color: 'white', fontWeight: 'bold' },
});
