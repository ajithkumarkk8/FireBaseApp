import auth, {firebase} from '@react-native-firebase/auth';
import axios from 'axios';
import React, {memo, useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View, Image, Alert} from 'react-native';
import {ActivityIndicator, Appbar, Colors, Text} from 'react-native-paper';
import {ScrollView} from 'react-navigation';
import {Navigation} from '../types';
import TextInput from '../components/TextInput';
import {theme} from '../core/theme';

type Props = {
  navigation: Navigation;
};

const Dashboard = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredObj, setFilteredObj] = useState(posts);
  useEffect(() => {
    postList();
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const postList = () => {
    const url = 'https://jsonplaceholder.typicode.com/posts';
    setLoading(true);
    axios
      .get(url)
      .then(response => {
        setLoading(false);
        setPosts(response.data);
        setFilteredObj(response.data);
        setError('');
      })
      .catch(err => {
        setLoading(false);
        setError(err.message);
      });
  };

  const onAuthStateChanged = user => {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  };

  if (initializing) {
    return null;
  }
  const _onLogOutPressed = async () => {
    try {
      await firebase.auth().signOut();
      navigation.navigate('LoginScreen');
      // console.log('logOut');
    } catch (err) {
      console.log('Sign Out Error.', err.message);
    }
  };

  const searchFilterFunction = () => {
    if (searchQuery) {
      let filteredPosts = posts.filter(post => {
        return post.title.toLowerCase().includes(searchQuery.toLowerCase());
      });

      setFilteredObj(filteredPosts);
      setPosts(filteredObj);
    } else if (searchQuery === '') {
      // alert();
      setFilteredObj(posts);
    }
  };

  return (
    <View style={styles.ViewHeader}>
      <Appbar.Header style={{flexDirection: 'row', justifyContent: 'center'}}>
        <Appbar.Content style={{alignItems: 'center'}} title="POST LIST" />
        <TouchableOpacity
          style={{}}
          onPress={() => {
            Alert.alert('LOGOUT', 'Do you wish to logout ?', [
              {
                text: 'Cancel',
                onPress: () => navigation.navigate('Dashboard'),
                style: 'cancel',
              },
              {text: 'OK', onPress: () => _onLogOutPressed()},
            ]);
          }}>
          <Text style={{color: '#fff', right: 10}}>LOGOUT</Text>
        </TouchableOpacity>
      </Appbar.Header>
      <View style={styles.viewStyle}>
        <TextInput
          style={{color: theme.colors.primary}}
          onChangeText={text => {
            setSearchQuery(text);
          }}
          value={searchQuery}
        />
        <TouchableOpacity
          style={{
            justifyContent: 'center',
            backgroundColor: 'red',
            marginTop: 45,
          }}
          onPress={searchFilterFunction}>
          <Image
            style={{
              height: 20,
              width: 20,
              tintColor: theme.colors.primary,
              position: 'absolute',
              right: 20,
            }}
            source={require('../assets/search.png')}
          />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {/* {posts.length <= 0 ? ( */}
        {filteredObj.length > 0 ? (
          filteredObj.map((post, id) => {
            return (
              <TouchableOpacity
                key={id}
                onPress={() => navigation.navigate('PostDetailScreen', post)}
                style={styles.TouchView}>
                <Text style={styles.postText}>{`${
                  post.id
                }. ${post.title?.toUpperCase()}`}</Text>
              </TouchableOpacity>
            );
          })
        ) : filteredObj.length == 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '60%',
            }}>
            <ActivityIndicator color={theme.colors.primary} />
            <Image
              source={require('../assets/box.png')}
              style={{height: 150, width: 150, tintColor: theme.colors.primary}}
            />
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 15,
                fontWeight: 'bold',
              }}>
              {'No Data Found !'}
            </Text>
          </View>
        ) : loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          error && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '60%',
              }}>
              <Image
                style={{height: 100, width: 100}}
                source={require('../assets/cloud.png')}
              />
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: 15,
                  fontWeight: 'bold',
                }}>
                {error}
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
};

export default memo(Dashboard);

const styles = StyleSheet.create({
  ViewHeader: {
    flex: 1,
  },
  TouchView: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#E6E6FA',
    height: 70,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  postText: {
    fontSize: 13,
    color: Colors.blue800,
    fontWeight: 'bold',
  },
  viewStyle: {
    flexDirection: 'row',
    // flex: 1,
    marginBottom: 40,
    height: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-evenly',
  },
});
