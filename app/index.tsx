import { Text, View, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/ApiConstants';
import { useSQLiteContext } from "expo-sqlite/next";
import * as SQLite from 'expo-sqlite';

const loadDatabase = async () => {
  const dbName = "codingtest.db";
  const dbAsset = require("../assets/codingtest.db");
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  if (!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    );
    await FileSystem.downloadAsync(dbUri, dbFilePath);
  }
}

interface UserType {
  name: string;
  age: string;
  url: string;
  culture: string;
  born: string;
  died: string;
  father: string;
  mother: string;
  spouse: string;
  titles?: string[];
  aliases?: string[];
  allegiances?: string[];
  books?: string[];
  povBooks?: string[];
  tvSeries?: string[];
  playedBy?: string[];
}

export default function Index() {
  const [dbLoaded, setDbLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [userData, setUserData] = useState<UserType[]>([]);


  const insertDataIntoDatabase = async (users: Array<UserType>) => {
    const db = await SQLite.openDatabaseAsync('codingtest.db');

    var query: string = "";
    users.forEach(user => {
      query = query + `INSERT INTO User (name, url, culture, born, died, father, mother, spouse, titles, aliases, allegiances, books, povBooks, tvSeries, playedBy) VALUES ('${user.name}', '${user.url}', '${user.culture}', '${user.born}', '${user.died}', '${user.father}', '${user.mother}', '${user.spouse}', '${user.titles?.join(',') ?? ""}', '${user.aliases?.join(',') ?? ""}', '${user.allegiances?.join(',') ?? ""}', '${user.books?.join(',') ?? ""}', '${user.povBooks?.join(',') ?? ""}', '${user.tvSeries?.join(',') ?? ""}', '${user.playedBy?.join(',') ?? ""}');`
    });
    db.execAsync(query);
    console.log('inserted records');
    setTimeout(() => {
      getDataFromDB();
    }, 2000);
  }

  const getDataFromDB = async () => {
    const db = await SQLite.openDatabaseAsync('codingtest.db');
    const allRows = await db.getAllAsync('SELECT * FROM User');
    console.log('get data from db ' + allRows);
    const temp = allRows.map((user: any) => ({
      ...user,
      aliases: user.aliases.split(','),
      allegiances: user.aliases.split(','),
      playedBy: user.aliases.split(','),
      povBooks: user.aliases.split(','),
      titles: user.titles.split(','),
      books: user.books.split(','),
    }));
    setDataLoaded(true);
    setUserData(temp);
  }

  function isUserType(data: any): data is UserType {
    return (
      Array.isArray(data.aliases) &&
      Array.isArray(data.allegiances) &&
      Array.isArray(data.books) &&
      typeof data.born === "string" &&
      typeof data.culture === "string" &&
      typeof data.died === "string" &&
      typeof data.father === "string" &&
      typeof data.gender === "string" &&
      typeof data.mother === "string" &&
      typeof data.name === "string" &&
      Array.isArray(data.playedBy) &&
      Array.isArray(data.povBooks) &&
      typeof data.spouse === "string" &&
      Array.isArray(data.titles) &&
      Array.isArray(data.tvSeries) &&
      typeof data.url === "string"
    );
  }


  const fetchData = () => {
    Promise.all([
      axios.get(BASE_URL + "300"),
      axios.get(BASE_URL + "301"),
      axios.get(BASE_URL + "302"),
      axios.get(BASE_URL + "303")
    ]).then(function (responses) {
      // Get a JSON object from each of the responses
      return Promise.all(responses.map(function (response) {
        return response.data;
      }));
    }).then(function (parsedData) {
      // Log the data to the console
      // You would do something with both sets of data here

      if (Array.isArray(parsedData) && parsedData.every(isUserType)) {
        const finalArray: UserType[] = parsedData;
        insertDataIntoDatabase(finalArray);
      } else {
        console.error("Invalid data format");
      }
    }).catch(function (error) {
      // if there's an error, log it
      console.log('error', error);
    });
  }

  useEffect(() => {
    console.log('db load method called');
    loadDatabase()
      .then(() => {
        setDbLoaded(true);
        console.log('fetchData method called');
        fetchData();
      })
      .catch((e) => console.error(e));
  }, []);

  const UserItem: React.FC<{ user: UserType }> = ({ user }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.field}>Born: {user.born || 'NA'}</Text>
        <Text style={styles.field}>Died: {user.died || 'NA'}</Text>
        <Text style={styles.field}>Spouse: {user.spouse || 'None'}</Text>
        <Text style={styles.field}>Culture: {user.culture || 'NA'}</Text>
        <Text style={styles.field}>Titles: {user.titles ? user.titles.join(', ') : 'NA' || 'NA'}</Text>
        <Text style={styles.field}>Aliases: {user.aliases ? user.aliases.join(', ') : 'NA' || 'NA'}</Text>
        <Text style={styles.field}>Played By: {user.playedBy ? user.playedBy.join(', ') : 'NA' || 'NA'}</Text>
        <Text style={styles.field}>Allegiances: {user.allegiances ? user.allegiances.join(', ') : 'NA'}</Text>
        <Text style={styles.field}>Books: {user.books ? user.books.join(', ') : 'NA'}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {!dataLoaded ? <View style={styles.loaderContainer}>
        <ActivityIndicator color={'#000000'} size={"large"} />
        <Text style= {styles.name}>Loading the data...</Text>
      </View> : <FlatList
        data={userData}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <UserItem user={item} />}
        contentContainerStyle={styles.listContainer}
      />}
    </View>

  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  field: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});
