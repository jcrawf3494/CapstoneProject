import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, StyleSheet, CheckBox, ScrollView } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';



const ScrollableListBios = ({ title, data }) => {
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [aiGeneratedBio, setAiGeneratedBio] = useState("");
    const [emailSent, setEmailSent] = useState(false); // State for checkbox

    useEffect(() => {
        fetch("http://localhost:8080/api/profiles")
            .then((response) => response.json())
            .then((data) => {
              console.log("Fetched profiles:", data);
               setProfiles(data);
            })
            .catch((error) => console.error("Error fetching profiles:", error));
    }, []);

    const handleDeleteProfile = async (id) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this profile?");
      if (!confirmDelete) return;
    
      try {
        await fetch(`http://localhost:8080/api/fosters/${id}`, {
          method: 'DELETE',
        });
    
        // Remove profile from local state
        const updatedProfiles = profiles.filter(profile => profile.id !== id);
        setProfiles(updatedProfiles);
        setFilteredProfiles(updatedProfiles);
        setSelectedProfile(null); // Go back to the list view after deletion
      } catch (error) {
        console.error("Failed to delete profile:", error);
        alert("Failed to delete profile. Please try again.");
      }
    };

    const handleSearch = (query) => {
      setSearchQuery(query);
      if (query.trim() === "") {
          setFilteredProfiles(profiles);
      } else {
          const filtered = profiles.filter(profile =>
              profile.id.toString().includes(query) ||
              profile.name.toLowerCase().includes(query.toLowerCase()) ||
              profile.email.toLowerCase().includes(query.toLowerCase()) ||
              profile.pet_name.toLowerCase().includes(query.toLowerCase())
          );
          setFilteredProfiles(filtered);
      }
  };

    const handleSelectProfile = (profile) => {
        setSelectedProfile(profile);
        setAiGeneratedBio(""); // Reset bio when selecting a new profile
    };

    const handleBackToList = () => {
      setSelectedProfile(null); // Go back to the list view
  };

    return (
        <View style={styles.listContainerBios}>
          <Text style={styles.header}>{title}</Text>

           {/* Search Bar */}
           <TextInput
                style={styles.searchBar}
                placeholder="Search profiles..."
                value={searchQuery}
                onChangeText={handleSearch}
            />

          
            <FlatList
                data={searchQuery ? filteredProfiles : profiles} // Show full list when no search is active
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelectProfile(item)} style={{ padding: 10, borderBottomWidth: 1 }}>
                        <View style={styles.item}>
                          <Text style={styles.title}>{item.name}</Text>
                          <Text style={styles.description}>Foster ID: {item.id}</Text>
                          <Text style={styles.description}>Email: {item.email}</Text>
                          <Text style={styles.description}>Phone: {item.phone_number}</Text>
                          <Text style={styles.description}>Pet Name: {item.pet_name}</Text>
                          <Text style={styles.description}>Preferred Contact Time: {item.preferred_contact_time}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {selectedProfile && (
              
                <View style={styles.listContainerBios}>
                  <ScrollView contentContainerStyle={styles.scrollViewContent}>
                  <View style={styles.selectedProfileContainer}>
                    <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
                      <Icon name="arrow-left" size={20} color="#fff" /> 
                    </TouchableOpacity>
                  </View>

                    <Text style={styles.selectedProfileTitle}>{selectedProfile.name}</Text>
                    <Text style={styles.selectedProfileDescription}>Foster ID: {selectedProfile.id}</Text>
                    <Text style={styles.selectedProfileDescription}>Email: {selectedProfile.email}</Text>
                    <Text style={styles.selectedProfileDescription}>Phone: {selectedProfile.phone_number}</Text>
                    <Text style={styles.selectedProfileDescription}>Pet Name: {selectedProfile.pet_name}</Text>
                    <Text style={styles.selectedProfileDescription}>Preferred Contact Time: {selectedProfile.preferred_contact_time}</Text>

                    {/* Email Sent to Photography Team Checkbox */}
                    <View style={styles.checkboxContainer}>
                        <CheckBox
                            value={selectedProfile?.email_sent === true} // Controlled by database value
                            disabled={true} // Read-only checkbox
                        />
                        <Text style={styles.checkboxLabel}>Email Sent to Photography Team</Text>
                    </View>

                    {/* AI-Generated Bio Section */}
                    <Text style={styles.bioTitle}>AI-Generated Bio:</Text>
                    <View style={styles.bioBox}>
                      <Text style={styles.transcription}>{selectedProfile.transcription}</Text>
                    </View>

                    {/* Delete Profile Button */}
                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                      <TouchableOpacity
                        onPress={() => handleDeleteProfile(selectedProfile.id)}
                        style={styles.deleteButton}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete Profile</Text>
                      </TouchableOpacity>
                    </View>

                    </ScrollView>
                    
                </View>
            )}
            
        </View>
    );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 10,
    backgroundColor: '#000',
    borderRadius: 50,
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 1,
  },
  bioBox: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginTop: 5, 
    width: '50%',
    height: '60%',
    alignSelf: "center"
  },
  bioTitle: {
    marginTop: 10,
    fontWeight: "bold",
    marginLeft: '25%',
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft: "40%",
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,

  },
  description: {
    fontSize: 14,
    color: 'gray',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d9534f',
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: 'gold',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  item: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  listContainerBios: {
    width: '90%',
    height: '90%',
    borderWidth: 3,
    borderColor: 'gold',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 20,
  },
  scrollViewContent: {
    paddingBottom: 70,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
    paddingLeft: 10,
    backgroundColor: '#f5f5f5',
    fontSize: 16,
  },
  selectedProfileDescription: {
    marginLeft: '40%',
    fontSize: 14,
    color: 'gray',
  },
  selectedProfileTitle: {
    marginTop: '5%',
    marginLeft: '40%',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedProfileContainer: {
    padding: 10,
    position: 'relative', // Ensure correct positioning for the back button
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transcription: {
    textAlignVertical: 'justifytop',
    justifyContent: 'center',
  },
});

export default ScrollableListBios;
