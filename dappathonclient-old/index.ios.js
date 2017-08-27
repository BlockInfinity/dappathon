import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import { AppRegistry, StyleSheet, ActivityIndicator, FlatList, Alert, Linking, TouchableOpacity } from 'react-native';
import { Examples, Button, Text, View, TextInput, Divider, Caption, Icon, Row, Image, Subtitle } from '@shoutem/ui';

const ENDPOINT = 'http://192.168.2.59:8080'
const DEBUG = true

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
    // fetch all accounts
    //!! debug mode
    if (DEBUG) {
      this.setState({
        isLoading: false,
        accounts: ['uedue21223323', 'dwud3h2udh3ud'],
        userAddress: 'uedue21223323'
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
      <View>
        <Divider />
        <Divider styleName="section-header">
          <Caption>PUPLIC KEY</Caption>
        </Divider>
        <TextInput
          defaultValue={this.state.accounts && this.state.accounts.length > 0 ? this.state.accounts[0] : null}
          onChangeText={(userAddress) => { this.setState({userAddress: userAddress}) }}
        />
        <Divider />
        <Button styleName="dark" onPress={() => { if (this.state.userAddress) { navigate('Home', { userAddress: this.state.userAddress })}}}>
          <Text>Login</Text>
        </Button>
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
      <View>
        <Divider />
        <Divider styleName="section-header">
          <Caption>PROFILE & CONTRACTS</Caption>
        </Divider>
        <Button styleName="dark" onPress={() => navigate('Profile', { userAddress: params.userAddress })}>
          <Text>My Profile</Text>
        </Button>
        <Divider />
        <Button styleName="dark" onPress={() => navigate('Contracts', { userAddress: params.userAddress })}>
          <Text>My Contracts</Text>
        </Button>
        <Divider />
        <Divider styleName="section-header">
          <Caption>INVESTMENT MANAGEMENT</Caption>
        </Divider>
        <Button styleName="dark" onPress={() => navigate('InvestorContracts', { userAddress: params.userAddress })}>
          <Text>My Investments</Text>
        </Button>
        <Divider />
        <Button styleName="dark" onPress={() => navigate('ContractSearch', { userAddress: params.userAddress })}>
          <Text>Investment Opportunities</Text>
        </Button>
      </View>
    )
  }
}

class Profile extends React.Component {
  static navigationOptions = {
    title: "My Profile",
    headerTintColor: "#ffffff",
    headerStyle: {
      backgroundColor: 'black'
    }
  }

  constructor(props) {
    super(props);
  }

  render() {
    const { navigate } = this.props.navigation
    const { params } = this.props.navigation.state

    if (!params || !params.userAddress) {
      return
    }

    return (
      <View>
        <Text>Photo</Text>
      </View>
    );
  }
}

class Contracts extends React.Component {
  static navigationOptions = {
    title: "My Contracts",
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
        contracts: [{ 'tokenAddress': 'dEDWdfdf', 'ownerName': 'Owner 1', 'tokenTitle': 'Title 1', 'tokenDescription': 'Description 1', 
          'tokenAmount': 10, 'tokenPrice': 1.23 }, { 'tokenAddress': 'dsdfsdf', 'ownerName': 'Owner 2', 'tokenTitle': 'Title 2', 'tokenDescription': 'Description 2', 
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
      <View>
        <Divider />
        <Divider styleName="section-header">
          <Caption>OWNER NAME</Caption>
          <Caption>PUBLIC KEY</Caption>
        </Divider>
        <FlatList style={Styles.list}
          data={this.state.contracts}
          renderItem={({item}) => 
            <TouchableOpacity onPress={() => navigate('Contract', { contractAddress: item.tokenAddress, userAddress: params.userAddress })}>
              <Row styleName="small">
                <Image
                  styleName="small-avatar"
                  source={{ uri: 'https://shoutem.github.io/img/ui-toolkit/examples/image-9.png' }}
                />
                <View styleName="vertical">
                  <Subtitle>{item.ownerName}</Subtitle>
                  <Text numberOfLines={1}>{item.tokenAddress}</Text>
                </View>
                <Icon styleName="disclosure" name="right-arrow" />
              </Row>
            </TouchableOpacity>
          }
          keyExtractor={(item, index) => index}
        />
        <Divider />
        <Button styleName="dark" onPress={() => navigate('CreateContract', { userAddress: params.userAddress })}>
          <Text>Create Contract</Text>
        </Button>
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
    this.state = {
      isLoading: false,
      description: '',
      identity: '',
      tokenPrice: TokenPriceInitial,
      tokenAmount: TokenAmountInitial
    }
  }

  onContractCreate(identity, description, price, amount) {
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
      navigate('CreateContractConfirm', {contractAddress: 'qwswsqwsw', userAddress: params.userAddress})
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
          identity: identity,
          tokenPrice: price,
          tokenAmount: amount
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
          navigate('CreateContractConfirm', {contractAddress: responseJson.workToken, userAddress: params.userAddress})
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
      <View>
        <Divider />
        <Divider styleName="section-header">
          <Caption>YOUR IDENTITY</Caption>
        </Divider>
        <TextInput
          defaultValue={params.userAddress}
          onChangeText={(identity) => {this.setState({identity: identity})}}
        />
        <Divider />
        <Divider styleName="section-header">
          <Caption>CONTRACT DESCRIPTION</Caption>
        </Divider>
        <TextInput
          multiline
          style={{ height: 150 }}
          placeholder={'Enter your description'} 
          onChangeText={(description) => {this.setState({description: description})}}
        />
        <Divider />
        <Divider styleName="section-header">
          <Caption>Price & Number of Tokens</Caption>
        </Divider>
        <TextInput
          placeholder={'Enter your price'}
          onChangeText={(price) => {this.setState({tokenPrice: price})}}
        />
        <TextInput
          placeholder={'Enter number of tokens'}
          onChangeText={(number) => {this.setState({tokenAmount: number})}}
        />
        <Divider />
        <Button styleName="dark" onPress={() => this.onContractCreate(this.state.identity, 
          this.state.description, this.state.tokenPrice, this.state.tokenAmount)}>
          <Text>Create Contract</Text>
        </Button>
      </View>
    );
  }
}

class CreateContractConfirm extends React.Component {
  static navigationOptions = {
    title: "Contract Created",
    headerTintColor: "#ffffff",
    headerStyle: {
      backgroundColor: 'black' 
    }
  }

  render() {
    const { params } = this.props.navigation.state;
    const { navigate } = this.props.navigation;

    return (
      <View>
        <Divider />
        <Text>Awesome! Your contract has been created and is now available for trading on EtherDelta</Text>
        <Divider />
        <Divider />
        <TouchableOpacity style={{
          justifyContent: 'center',
          alignItems: 'center',
          }} onPress={() => {
          Linking.canOpenURL('https://etherscan.io/token/' + params.contractAddress).then(supported => {
            if (supported) {
              Linking.openURL('https://etherscan.io/token/' + params.contractAddress);
            } else {
              Alert.alert(
                'Error',
                'Don\'t know how to open URI: https://etherscan.io/token/' + params.contractAddress,
                [
                  {text: 'OK', onPress: () => console.log('OK Pressed')}
                ],
                { cancelable: false }
              )
            }
          })
        }}>
          <Image
            source={require('./delta.png')}
          />
        </TouchableOpacity>
        <Divider />
        <Divider />
        <Button styleName="dark" onPress={() => navigate('Home', { userAddress: params.userAddress })}>
          <Text>Back to Home</Text>
        </Button>
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
        contract: { 'tokenAddress': 'dEDWDE', 'ownerAddress': 'wedwede', 'tokenTitle': 'Title 1', 'ownerAddress': 'wedwede', 'description': 'Description 1', 
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
      <View>
        <Divider />
        <Divider styleName="section-header">
          <Caption>CONTRACT PUBLIC KEY</Caption>
        </Divider>
        <TextInput editable={false} defaultValue={this.state.contract.tokenAddress}/>
        <Divider styleName="section-header">
          <Caption>OWNER IDENTITY</Caption>
        </Divider>
        <TextInput editable={false} defaultValue={this.state.contract.ownerAddress}/>
        <Divider />
        <Divider styleName="section-header">
          <Caption>CONTRACT DESCRIPTION</Caption>
        </Divider>
        <TextInput
          editable={false}
          style={{ height: 100 }}
          defaultValue={this.state.contract.description}
        />
        <Divider />
        <Divider styleName="section-header">
          <Caption>OWNER PROFILE & TRADING</Caption>
        </Divider>
        <Button styleName="dark" onPress={() => navigate('Profile', { userAddress: this.state.contract.ownerAddress })}>
          <Text>Show Owner Profile</Text>
        </Button>
        <Divider />
        <Button styleName="dark" onPress={() => { 
          Linking.canOpenURL('https://etherscan.io/token/' + this.state.contract.tokenAddress).then(supported => {
            if (supported) {
              Linking.openURL('https://etherscan.io/token/' + this.state.contract.tokenAddress);
            } else {
              Alert.alert(
                'Error',
                'Don\'t know how to open URI: https://etherscan.io/token/' + this.state.contract.tokenAddress,
                [
                  {text: 'OK', onPress: () => console.log('OK Pressed')}
                ],
                { cancelable: false }
              )
            }
          });
        }}>
          <Text>Go To EtherDelta</Text>
        </Button>
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
  Contracts: { screen: Contracts },
  ContractSearch: { screen: ContractSearch },
  InvestorContracts: { screen: InvestorContracts },
  Contract: { screen: Contract },
  CreateContract: { screen: CreateContract },
  CreateContractConfirm: { screen: CreateContractConfirm }
});

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
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
  texti: {
    height: 100
  }
});

AppRegistry.registerComponent('dappathonclient', () => App);
