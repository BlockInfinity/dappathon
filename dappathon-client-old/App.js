import React from 'react';
import { StyleSheet, Text, View, FlatList, Button, Picker, TextInput, 
  ActivityIndicator, ListView, Alert } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Examples } from '@shoutem/ui';
import { Font } from 'expo';

const ENDPOINT = 'http://192.168.2.59:8080'
const DEBUG = false

const TokenAmountMax = 20
const TokenAmountInitial = 10
const TokenPriceMax = 20
const TokenPriceInitial = 10

class Login extends React.Component {
  static navigationOptions = {
    title: 'Login',
    headerTintColor: '#ffffff',
    headerStyle: {
      backgroundColor: 'black'
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      accounts: [],
      userAddress: null
    }
  }

  componentDidMount() {
    Font.loadAsync({
      'Rubik-Black': require('./node_modules/@shoutem/ui/fonts/Rubik-Black.ttf'),
      'Rubik-BlackItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-BlackItalic.ttf'),
      'Rubik-Bold': require('./node_modules/@shoutem/ui/fonts/Rubik-Bold.ttf'),
      'Rubik-BoldItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-BoldItalic.ttf'),
      'Rubik-Italic': require('./node_modules/@shoutem/ui/fonts/Rubik-Italic.ttf'),
      'Rubik-Light': require('./node_modules/@shoutem/ui/fonts/Rubik-Light.ttf'),
      'Rubik-LightItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-LightItalic.ttf'),
      'Rubik-Medium': require('./node_modules/@shoutem/ui/fonts/Rubik-Medium.ttf'),
      'Rubik-MediumItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-MediumItalic.ttf'),
      'Rubik-Regular': require('./node_modules/@shoutem/ui/fonts/Rubik-Regular.ttf'),
      'rubicon-icon-font': require('./node_modules/@shoutem/ui/fonts/rubicon-icon-font.ttf'),
    });

    // fetch all accounts
    //!! debug mode
    if (DEBUG) {
      this.setState({
        isLoading: false,
        accounts: ['uedue21223323', 'dwud3h2udh3ud']
      })
      return
    }
    //!! debug mode

    return fetch(ENDPOINT + '/general/getAccounts')
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          accounts: responseJson,
          userAddress: responseJson && responseJson.length > 0 ? responseJson[0] : null,
          isLoading: false
        })
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isLoading: false
        }, function() {
          Alert.alert(
            'Error',
            'An error occured while fetching all accounts! Please try again in a few seconds.',
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')}
            ],
            { cancelable: false }
          )
        })
      })
  }


  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={Styles.container}>
        <Examples />
        <Text style={Styles.baseText4}>User Accounts:</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               selectedValue={this.state.userAddress}
               onValueChange={(userAddress) => this.setState({userAddress})}>
              {this.state.accounts.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Button style={Styles.item} onPress={() => { if (this.state.userAddress) { navigate('Home', { userAddress: this.state.userAddress })}}} title={'Login'}
        />
      </View>
    )
  }
}

class Home extends React.Component {
  static navigationOptions = {
    title: "Home",
    headerTintColor: "#ffffff",
    headerStyle: {
      backgroundColor: 'black'
    }
  }

  constructor(props) {
    super(props)
  }

  render() {
    const { navigate } = this.props.navigation
    const { params } = this.props.navigation.state
    return (
      <View style={Styles.container}>
        <Button style={Styles.item} onPress={() => navigate('Profile', { userAddress: params.userAddress })} title={'Profile'}/>
        <Button style={Styles.item} onPress={() => navigate('InvestorContracts', { userAddress: params.userAddress })} title={'Investments'}/>
        <Button style={Styles.item} onPress={() => navigate('ContractSearch', { userAddress: params.userAddress })} title={'Search'}/>
      </View>
    )
  }
}

class Profile extends React.Component {
  static navigationOptions = {
    title: "Profile",
    headerTintColor: "#ffffff",
    headerStyle: {
      backgroundColor: 'black'
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      contracts: []
    }
  }

  componentDidMount() {
    //!! debug mode
    if (DEBUG) {
      this.setState({
        isLoading: false,
        contracts: [{ 'address': 'dEDWdfdf', 'tokenTitle': 'Title 1', 'tokenDescription': 'Description 1', 
          'tokenAmount': 10, 'tokenPrice': 1.23 }, { 'address': 'dsdfsdf', 'tokenTitle': 'Title 2', 'tokenDescription': 'Description 2', 
          'tokenAmount': 20, 'tokenPrice': 2.23 }]
      })
      return
    }
    //!! debug mode

    const { params } = this.props.navigation.state

    if (!params || !params.userAddress) {
      return
    }

    return fetch(ENDPOINT + '/humanworkerfactory/getContractsByOwner?address=' + params.userAddress)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          isLoading: false,
          contracts: responseJson
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isLoading: false
        }, function() {
          Alert.alert(
            'Error',
            'An error occured while fetching contracts! Please try again in a few seconds.',
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')}
            ],
            { cancelable: false }
          )
        });
      });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    const { navigate } = this.props.navigation
    const { params } = this.props.navigation.state
    return (
      <View style={Styles.container}>
        <Text style={Styles.baseText4}>Contracts:</Text>
        <FlatList style={Styles.list}
          data={this.state.contracts}
          renderItem={({item}) => 
            <Button style={Styles.item} onPress={() => navigate('Contract', { contractAddress: item.tokenAddress, userAddress: params.userAddress })} title={item.tokenName + ' ' + item.description}/>
          }
          keyExtractor={(item, index) => index}
        />
        <Button style={Styles.item} onPress={() => navigate('CreateContract', { userAddress: params.userAddress })} title={'New Contract'}/>
      </View>
    );
  }
}

class CreateContract extends React.Component {
  static navigationOptions = {
    title: "Create Contract",
    headerTintColor: "#ffffff",
    headerStyle: {
      backgroundColor: 'black' 
    }
  }

  constructor(props) {
    super(props)
    const { params } = props.navigation.state
    let tokenAmountList = []
    for (var i=1; i<=TokenAmountMax; i++) {
      tokenAmountList.push(i)
    }
    let tokenPriceList = []
    for (var i=1; i<=TokenPriceMax; i++) {
      tokenPriceList.push(i)
    }
    console.log(tokenAmountList)
    console.log(tokenPriceList)
    this.state = {
      isLoading: false,
      description: '',
      tokenAmountList: tokenAmountList,
      tokenAmount: TokenAmountInitial,
      tokenAmountSelected: 1,
      tokenPriceList: tokenPriceList,
      tokenPrice: TokenPriceInitial,
      tokenPriceSelected: 1
    }
  }

  onContractCreate(tokenAmount, tokenPrice, description) {
    // check if some other action is currently processing
    if (this.state.isLoading) {
      Alert.alert(
        'Warning',
        'Some other action is currently processing! Please try again in a few seconds.',
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')}
        ],
        { cancelable: false }
      )
      return
    }

    //////
    // push to server
    //////

    const { navigate } = this.props.navigation
    const { params } = this.props.navigation.state

    //!! debug mode
    if (DEBUG) {
      console.log({
        description: description,
        fromAddress: params.userAddress,
        identity: params.userAddress
      })
      return
    }
    //!! debug mode

    // -> request new insurance
    this.setState({
      isLoading: true
    }, () => {
      return fetch(ENDPOINT + '/humanworkerfactory/createHumanWorker', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: description,
          fromAddress: params.userAddress,
          identity: params.userAddress
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          isLoading: false
        }, () => {
          Alert.alert(
            'Success',
            'Contract created!',
            [
              {text: 'OK', onPress: () => navigate('Profile')}
            ],
            { cancelable: false }
          )
          console.log(responseJson)
          navigate('Contract', {contractAddress: responseJson.workToken})
        })
      })
      .catch((error) => {
        console.log(error)
        this.setState({
          isLoading: false
        }, () => {
          Alert.alert(
            'Error',
            'Contract could not be created! Please try again.',
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')}
            ],
            { cancelable: false }
          )
        })
      });
    })
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    const { params } = this.props.navigation.state;
    const { navigate } = this.props.navigation;

    return (
      <View style={Styles.container}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               selectedValue={this.state.tokenAmountSelected}
               onValueChange={(tokenAmountSelected) => this.setState({tokenAmountSelected})}>
              {this.state.tokenAmountList.map((i) => {
                return <Picker.Item key={i} value={i} label={String(i)}/>
              })}
            </Picker>
          </View>
        </View>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               selectedValue={this.state.tokenPriceSelected}
               onValueChange={(tokenPriceSelected) => this.setState({tokenPriceSelected})}>
              {this.state.tokenPriceList.map((i) => {
                return <Picker.Item key={i} value={i} label={String(i)}/>
              })}
            </Picker>
          </View>
        </View>
        <Button style={Styles.item} onPress={() => this.onContractCreate(this.state.tokenAmountSelected, 
          this.state.tokenPriceSelected, this.state.description)} title={'Create Token'}/>
      </View>
    );
  }
}

class Contract extends React.Component {
  static navigationOptions = {
    title: "Contract",
    headerTintColor: "#ffffff",
    headerStyle: {
      backgroundColor: 'black' 
    }
  }

  constructor(props) {
    super(props)
    const { params } = props.navigation.state
    this.state = {
      isLoading: true,
      contract: null
    }
  }

  componentDidMount() {
    //!! debug mode
    if (DEBUG) {
      this.setState({
        isLoading: false,
        contract: { 'address': 'dEDWDE', 'tokenTitle': 'Title 1', 'tokenDescription': 'Description 1', 
          'tokenAmount': 10, 'tokenPrice': 1.23 }
      })
      return
    }
    //!! debug mode

    const { params } = this.props.navigation.state

    if (!params || !params.contractAddress) {
      return
    }

    return fetch(ENDPOINT + '/humanworkerfactory/getContractByAddress?address=' + params.contractAddress)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          isLoading: false,
          contract: responseJson
        })
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isLoading: false
        }, function() {
          Alert.alert(
            'Error',
            'An error occured while fetching contracts! Please try again in a few seconds.',
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')}
            ],
            { cancelable: false }
          )
        });
      });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    const { params } = this.props.navigation.state;
    const { navigate } = this.props.navigation;
    return (
      <View style={Styles.container}>
        <Text style={Styles.baseText4}>Link to EtherDelta: https://etherscan.io/token/{this.state.contract.tokenAddress}</Text>
        <Text style={Styles.baseText4}>Token Description</Text>
        <Text style={Styles.baseText4}>{this.state.contract.description}</Text>
        <Text style={Styles.baseText4}>Number of Tokens</Text>
        <Text style={Styles.baseText4}>{this.state.contract.tokenAmount}</Text>
        <Text style={Styles.baseText4}>Price per Token</Text>
        <Text style={Styles.baseText4}>{this.state.contract.tokenPrice}</Text>
      </View>
    );
  }
}

class ContractSearch extends React.Component {
  static navigationOptions = {
    title: "Search Contracts",
    headerTintColor: "#ffffff",
    headerStyle: {
      backgroundColor: 'black'
    }
  }

  constructor(props) {
    super(props)
    const { params } = props.navigation.state
    this.state = {
      isLoading: true,
      contracts: [],
      filteredContracts: [],
      searchTerm: ''
    }
  }

  componentDidMount() {
    // fetch all contracts

    //!! debug mode
    if (DEBUG) {
      this.setState({
        isLoading: false,
        contracts: [{ 'address': 'dEDWDE', 'tokenTitle': 'Title 1', 'tokenDescription': 'Description 1', 
          'tokenAmount': 10, 'tokenPrice': 1.23 }, { 'address': 'dEDWDE', 'tokenTitle': 'Title 2', 'tokenDescription': 'Description 2', 
          'tokenAmount': 20, 'tokenPrice': 2.23 }]
      })
      return
    }
    //!! debug mode

    const { navigate } = this.props.navigation
    const { params } = this.props.navigation.state

    // fetch all contracts
    return fetch(ENDPOINT + '/humanworkerfactory/getContracts')
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          isLoading: false,
          contracts: responseJson,
          filteredContracts: responseJson
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isLoading: false
        }, function() {
          Alert.alert(
            'Error',
            'An error occured while fetching contracts! Please try again in a few seconds.',
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')}
            ],
            { cancelable: false }
          )
        });
      });
  }

  onSearch(searchTerm) {
    
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    const { params } = this.props.navigation.state;
    const { navigate } = this.props.navigation;
    return (
      <View style={Styles.container}>
        <Text style={Styles.baseText4}>Search Term</Text>
        <FlatList style={Styles.list}
          data={this.state.filteredContracts}
          renderItem={({item}) => 
            <Button style={Styles.item} onPress={() => navigate('Contract', { contractAddress: item.address })} title={item.tokenName + ' ' + item.description}/>
          }
          keyExtractor={(item, index) => index}
        />
      </View>
    );
  }
}

class InvestorContracts extends React.Component {
  static navigationOptions = {
    title: "Investor Contracts",
    headerTintColor: "#ffffff",
    headerStyle: {
      backgroundColor: 'black'
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      contracts: []
    }
  }

  componentDidMount() {
    //!! debug mode
    if (DEBUG) {
      this.setState({
        isLoading: false,
        contracts: [{ 'address': 'dEDWDE', 'tokenTitle': 'Title 1', 'tokenDescription': 'Description 1', 
          'tokenAmount': 10, 'tokenPrice': 1.23 }]
      })
      return
    }
    //!! debug mode

    const { params } = this.props.navigation.state

    return fetch(ENDPOINT + '/humanworkerfactory/getAllContractsForInvestor?address=' + params.userAddress)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          isLoading: false,
          contracts: responseJson
        })
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isLoading: false
        }, function() {
          Alert.alert(
            'Error',
            'An error occured while fetching energy system incomes! Please try again in a few seconds.',
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')}
            ],
            { cancelable: false }
          )
        });
      });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    const { navigate } = this.props.navigation
    const { params } = this.props.navigation.state
    return (
      <View style={Styles.container}>
        <Text style={Styles.baseText4}>Investments:</Text>
        <FlatList style={Styles.list}
          data={this.state.contracts}
          renderItem={({item}) => 
            <Button style={Styles.item} onPress={() => navigate('Contract', { contractAddress: item.tokenAddress })} title={item.tokenName + ' ' + item.description}/>
          }
          keyExtractor={(item, index) => index}
        />
      </View>
    );
  }
}

export default App = StackNavigator({
  Login: { screen: Login },
  Home: { screen: Home },
  Profile: { screen: Profile },
  InvestorContracts: { screen: InvestorContracts },
  Contract: { screen: Contract },
  CreateContract: { screen: CreateContract },
  ContractSearch: { screen: ContractSearch },
  InvestorContracts: { screen: InvestorContracts }
});

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  baseText1: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  baseText2: {
    fontSize: 15,
  },
  baseText3: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  baseText4: {
    marginTop: 40,
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    margin: 40,
    width: 300,
  },
  item: {
    fontSize: 18,
    height: 44,
    color: 'blue'
  },
});
