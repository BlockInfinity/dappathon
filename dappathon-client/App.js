import React from 'react';
import { StyleSheet, Text, View, FlatList, Button, Picker, TextInput, 
  ActivityIndicator, ListView, Alert } from 'react-native';
import { StackNavigator } from 'react-navigation';

const ENDPOINT = 'http://localhost:8081'
const DEBUG = true

const TokenAmountMax = 10000
const TokenAmountInitial = 100
const TokenPriceMax = 1000
const TokenPriceInitial = 100

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

    return fetch(ENDPOINT + '/general/getAllAccounts')
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          accounts: responseJson.accounts,
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
        <Text style={Styles.baseText4}>User Accounts:</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               onValueChange={(userAddress) => this.setState({userAddress})}>
              {this.state.accounts.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Button style={Styles.item} onPress={() => 
          if (this.state.userAddress) {
            navigate('Home', { userAddress: this.state.userAddress })} title={'Login'}
          }
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
        <Button style={Styles.item} onPress={() => navigate('Investments', { userAddress: params.userAddress })} title={'Investments'}/>
        <Button style={Styles.item} onPress={() => navigate('Search', { userAddress: params.userAddress })} title={'Search'}/>
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
      contracts: [],
      totalBalance: 0
    }
  }

  componentDidMount() {
    //!! debug mode
    if (DEBUG) {
      this.setState({
        isLoading false,
        contracts: [{ 'address': 'dEDWdfdf', tokenTitle': 'Title 1', 'tokenDescription': 'Description 1', 
          'tokenAmount': 10, 'tokenPrice': 1.23 }, { 'address': 'dsdfsdf', tokenTitle': 'Title 2', 'tokenDescription': 'Description 2', 
          'tokenAmount': 20, 'tokenPrice': 2.23 }]
      })
      return
    }
    //!! debug mode

    const { params } = this.props.navigation.state

    return fetch(ENDPOINT + '/general/getContracts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: params.userAddress
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          isLoading: false,
          contracts: responseJson.contracts
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
        <Text style={Styles.baseText1}>Total Balance:</Text>
        <Text style={Styles.baseText3}>{this.state.totalBalance}</Text>
        <Text style={Styles.baseText4}>Contracts:</Text>
        <FlatList style={Styles.list}
          data={this.state.contracts}
          renderItem={({contract}) => 
            <Button style={Styles.item} onPress={() => navigate('Contract', { contractAddress: contract.address, userAddress: params.userAddress })} title={contract.tokenTitle + ' ' + contract.tokenAmount}/>
          }
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
    this.state = {
      isLoading: false,
      tokenAmountList: tokenAmountList,
      tokenAmount: TokenAmountInitial,
      tokenPriceList: TokenPriceList,
      tokenPrice: TokenPriceInitial
    }
  }

  onContractCreate(tokenAmount, tokenPrice, tokenTitle, tokenDescription) {
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
        userAddress: params.userAddress,
        tokenTitle: tokenTitle,
        tokenDescription: tokenDescription,
        tokenAmount: tokenAmount,
        tokenPrice: tokenPrice
      })
      return
    }
    //!! debug mode

    // -> request new insurance
    this.setState({
      isLoading: true
    }, () => {
      return fetch(ENDPOINT + '/general/createContract', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userAddress: params.userAddress,
          tokenTitle: tokenTitle,
          tokenDescription: tokenDescription,
          tokenAmount: tokenAmount,
          tokenPrice: tokenPrice
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
            'Tokens pay out!',
            [
              {text: 'OK', onPress: () => navigate('Profile')}
            ],
            { cancelable: false }
          )
          navigate('Contract', {contractAddress: responseJson.address})
        })
      })
      .catch((error) => {
        console.log(error)
        this.setState({
          isLoading: false
        }, () => {
          Alert.alert(
            'Error',
            'Tokens could not be pay out! Please try again.',
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
        <Text style={Styles.baseText4}>Link to EtherDelta</Text>
        <Text style={Styles.baseText4}>Token Title</Text>
        <Text style={Styles.baseText4}>Token Description</Text>
        <Text style={Styles.baseText4}>Number of Tokens</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               onValueChange={(tokenAmount) => this.setState({tokenAmount})}>
              {this.state.tokenAmountList.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Text style={Styles.baseText4}>Price per Token</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               onValueChange={(tokenPrice) => this.setState({tokenPrice})}>
              {this.state.tokenPriceList.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Button style={Styles.item} onPress={() => this.onContractCreate(this.state.tokenAmount, 
          this.state.tokenPrice, this.state.tokenTitle, this.state.tokenDescription)} title={'Create Token'}/>
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
        isLoading false,
        contract: { 'address': 'dEDWDE', tokenTitle': 'Title 1', 'tokenDescription': 'Description 1', 
          'tokenAmount': 10, 'tokenPrice': 1.23 }
      })
      return
    }
    //!! debug mode

    const { params } = this.props.navigation.state

    return fetch(ENDPOINT + '/general/getContractById', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: params.contractAddress
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          isLoading: false,
          contract: responseJson.contract
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

    const { params } = this.props.navigation.state;
    const { navigate } = this.props.navigation;
    return (
      <View style={Styles.container}>
        <Text style={Styles.baseText4}>Link to EtherDelta</Text>
        <Text style={Styles.baseText4}>Token Public Key</Text>
        <Text style={Styles.baseText4}>{this.state.contract.address}<</Text>
        <Text style={Styles.baseText4}>Token Title</Text>
        <Text style={Styles.baseText4}>{this.state.contract.tokenTitle}<</Text>
        <Text style={Styles.baseText4}>Token Description</Text>
        <Text style={Styles.baseText4}>{this.state.contract.tokenDescription}<</Text>
        <Text style={Styles.baseText4}>Number of Tokens</Text>
        <Text style={Styles.baseText4}>{this.state.contract.tokenAmount}<</Text>
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
      searchTerm: ''
    }
  }

  componentDidMount() {
    // fetch all contracts
    this.onSearch(this.state.searchTerm)
  }

  onSearch(searchTerm) {
    //!! debug mode
    if (DEBUG) {
      this.setState({
        isLoading: false,
        contracts: [{ 'address': 'dEDWDE', tokenTitle': 'Title 1', 'tokenDescription': 'Description 1', 
          'tokenAmount': 10, 'tokenPrice': 1.23 }, { 'address': 'dEDWDE', tokenTitle': 'Title 2', 'tokenDescription': 'Description 2', 
          'tokenAmount': 20, 'tokenPrice': 2.23 }],
        searchTerm: ''
      })
      return
    }
    //!! debug mode

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

    // fetch all contracts
    return fetch(ENDPOINT + '/general/getAllContracts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchTerm: searchTerm
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          isLoading: false,
          contracts: responseJson.contracts,
          searchTerm: ''
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

    const { params } = this.props.navigation.state;
    const { navigate } = this.props.navigation;
    return (
      <View style={Styles.container}>
        <Text style={Styles.baseText4}>Search Term</Text>
        <FlatList style={Styles.list}
          data={this.state.contracts}
          renderItem={({contract}) => 
            <Button style={Styles.item} onPress={() => navigate('Contract', { contractAddress: contract.address })} title={contract.tokenTitle + ' ' + contract.tokenAmount}/>
          }
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
        contracts: [{ 'address': 'dEDWDE', tokenTitle': 'Title 1', 'tokenDescription': 'Description 1', 
          'tokenAmount': 10, 'tokenPrice': 1.23 }]
      })
      return
    }
    //!! debug mode

    const { params } = this.props.navigation.state

    return fetch(ENDPOINT + '/general/getAllContractsForInvestor', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: params.userAddress
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          isLoading: false,
          contracts: responseJson.contracts
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
          renderItem={({contract}) => 
            <Button style={Styles.item} onPress={() => navigate('Contract', { contractAddress: contract.address })} title={contract.tokenTitle + ' ' + contract.tokenAmount}/>
          }
        />
      </View>
    );
  }
}

export default App = StackNavigator({
  Login: { screen: Login },
  Home: { screen: Home },
  Profile: { screen: Profile },
  Investments: { screen: Investments },
  Search: { screen: Search },
  Contract: { screen: Contract },
  CreateContract: { screen: CreateContract },
  ContractSearch: { screen: ContractSearch },
  InvestorContracts: { screen: InvestorContracts }
});

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7b843',
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
