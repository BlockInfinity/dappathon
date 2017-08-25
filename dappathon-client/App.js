import React from 'react';
import { StyleSheet, Text, View, FlatList, Button, Picker, TextInput, ActivityIndicator, ListView, Alert } from 'react-native';
import { StackNavigator } from 'react-navigation';

const ENDPOINT = 'http://localhost:8081'

class Login extends React.Component {
  static navigationOptions = {
    title: "Login",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      accounts: [],
      energySupplier: null
    }
  }

  componentDidMount() {
    // fetch all accounts
    return fetch(ENDPOINT + '/general/getAllAccounts')
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          accounts: responseJson.accounts
        }, () => {
          // fetch energy supplier account
          return fetch(ENDPOINT + '/general/getEnergySupplier')
            .then((response) => response.json())

            .then((responseJson) => {
              console.log(responseJson)
              this.setState({
                isLoading: false,
                energySupplier: responseJson.energysupplier
              })
            })
            .catch((error) => {
              console.log(error);
              this.setState({
                isLoading: false
              }, function() {
                Alert.alert(
                  'Error',
                  'An error occured while fetching energy supplier account! Please try again in a few seconds.',
                  [
                    {text: 'OK', onPress: () => console.log('OK Pressed')}
                  ],
                  { cancelable: false }
                )
              })
            })
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
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    const { navigate } = this.props.navigation;
    return (
      <View style={Styles.container}>
        <Text style={Styles.baseText1}>Shareholder</Text>
        <Button style={Styles.item} onPress={() => navigate('ShareholderHome', { shareholderAddress: this.state.accounts[0] })} title={'Go to Shareholder Home'}/>
        <Text style={Styles.baseText1}>Energy Supplier</Text>
        <Button style={Styles.item} onPress={() => navigate('EnergySupplierHome', { energySupplierAddress: this.state.energySupplier })} title={'Go to EnergySupplier Home'}/>
      </View>
    )
  }
}

class ShareholderHome extends React.Component {
  static navigationOptions = {
    title: "Shareholder Home",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      balance: 0,
      energySystemTokens: []
    }
  }

  componentDidMount() {
    const { params } = this.props.navigation.state
    return fetch(ENDPOINT + '/general/getKwhTokenBalance', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: params.shareholderAddress
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          balance: responseJson.balance
        }, () => {
          return fetch(ENDPOINT + '/shareholder/getAllMyEnergySystemTokens', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              yourAddress: params.shareholderAddress
            })
          })
          .then((response) => response.json())
          .then((responseJson) => {
            console.log(responseJson)
            this.setState({
              isLoading: false,
              energySystemTokens: responseJson
            });
          })
          .catch((error) => {
            console.log(error);
            this.setState({
              isLoading: false
            }, function() {
              Alert.alert(
                'Error',
                'An error occured while fetching all energy system tokens! Please try again in a few seconds.',
                [
                  {text: 'OK', onPress: () => console.log('OK Pressed')}
                ],
                { cancelable: false }
              )
            });
          });
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isLoading: false
        }, function() {
          Alert.alert(
            'Error',
            'An error occured while fetching kwh token balance! Please try again in a few seconds.',
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
        <Text style={Styles.baseText1}>Virtueller Speicher:</Text>
        <Text style={Styles.baseText3}>{this.state.balance}</Text>
        <Text style={Styles.baseText4}>Beteiligungen:</Text>
        <FlatList style={Styles.list}
          data={this.state.energySystemTokens}
          renderItem={({item}) => 
            <Button style={Styles.item} onPress={() => navigate('ShareholderEnergySystemToken', { energySystemToken: item, shareholderAddress: params.shareholderAddress })} title={'EnergySystemToken: ' + item.estoken + ' Share: ' + item.balance}/>
          }
        />
        <Button style={Styles.item} onPress={() => navigate('ShareholderTransactions', { shareholderAddress: params.shareholderAddress })} title={'All Incomes'}/>
        <Button style={Styles.item} onPress={() => navigate('ShareholderPayOutTokens', { shareholderAddress: params.shareholderAddress, balance: this.state.balance })} title={'Pay Out kWh-Tokens'}/>
        <Button style={Styles.item} onPress={() => navigate('ShareholderSendTokens', { shareholderAddress: params.shareholderAddress, balance: this.state.balance })} title={'Send kWh-Tokens'}/>
      </View>
    );
  }
}

class ShareholderPayOutTokens extends React.Component {
  static navigationOptions = {
    title: "ShareholderPayOutTokens",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props)
    const { params } = props.navigation.state
    let payoutValueList = []
    for (var i = 1; i <= params.balance; i++) {
      payoutValueList.push(i)
    }
    this.state = {
      isLoading: false,
      payoutValueList: payoutValueList,
      payoutValue: 0
    }
  }

  onPayOut(payoutValue) {
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

    // -> request new insurance
    this.setState({
      isLoading: true
    }, () => {
      return fetch(ENDPOINT + '/energysystemtoken/payout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yourAddress: params.shareholderAddress,
          value: payoutValue
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
              {text: 'OK', onPress: () => navigate('InsurantHome')}
            ],
            { cancelable: false }
          )
          navigate('ShareholderHome')
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
        <Text style={Styles.baseText4}>Value to Pay Out:</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               onValueChange={(payoutValue) => this.setState({payoutValue})}>
              {this.state.payoutValueList.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Button style={Styles.item} onPress={() => this.onPayOut(this.state.payoutValue)} title={'Pay Out Tokens'}/>
      </View>
    );
  }
}

class ShareholderSendTokens extends React.Component {
  static navigationOptions = {
    title: "ShareholderSendTokens",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props)
    const { params } = props.navigation.state
    let sendValueList  = []
    for (var i = 1; i <= params.balance; i++) {
      sendValueList.push(i)
    }
    this.state = {
      isLoading: false,
      sendValueList: sendValueList,
      sendValue: 0,
      sendTokenList: sendTokenList,
      sendToken: null,
      sendToList: sendToList,
      sendTo: null
    }
  }

  componentDidMount() {
    // fetch all accounts
    return fetch(ENDPOINT + '/general/getAllAccounts')
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          sendToList: responseJson.accounts
        }, () => {
          // fetch all tokens
          return fetch(ENDPOINT + '/general/getAllEnergySystemTokens')
            .then((response) => response.json())
            .then((responseJson) => {
              console.log(responseJson)
              this.setState({
                sendTokenList: responseJson.estokens
              })
            })
            .catch((error) => {
              console.log(error);
              this.setState({
                isLoading: false
              }, function() {
                Alert.alert(
                  'Error',
                  'An error occured while fetching all tokens! Please try again in a few seconds.',
                  [
                    {text: 'OK', onPress: () => console.log('OK Pressed')}
                  ],
                  { cancelable: false }
                )
              })
            })
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

  onSend(to, sendValue, estoken) {
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

    // -> request new insurance
    this.setState({
      isLoading: true
    }, () => {
      return fetch(ENDPOINT + '/kwhtoken/transfer', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estoken: estoken,
          value: sendValue,
          from: params.shareholderAddress,
          to: to
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
            'Tokens send!',
            [
              {text: 'OK', onPress: () => navigate('InsurantHome')}
            ],
            { cancelable: false }
          )
          navigate('ShareholderHome')
        })
      })
      .catch((error) => {
        console.log(error)
        this.setState({
          isLoading: false
        }, () => {
          Alert.alert(
            'Error',
            'Tokens could not be sent! Please try again.',
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
        <Text style={Styles.baseText4}>Send To:</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               onValueChange={(sendTo) => this.setState({sendTo})}>
              {this.state.sendToList.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Text style={Styles.baseText4}>Value:</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               onValueChange={(sendValue) => this.setState({sendValue})}>
              {this.state.sendValueList.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Text style={Styles.baseText4}>Send to Token:</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               onValueChange={(sendToken) => this.setState({sendToken})}>
              {this.state.sendTokenList.map((i) => {
                return <Picker.Item key={sendToken.estoken} value={sendToken.estoken} label={sendToken.estoken}/>
              })}
            </Picker>
          </View>
        </View>
        <Button style={Styles.item} onPress={() => this.onSend(this.state.sendTo, this.state.sendValue,this.state.sendToken)} title={'Send Tokens'}/>
      </View>
    );
  }
}

class ShareholderTransactions extends React.Component {
  static navigationOptions = {
    title: "Shareholder Transactions",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      incomes: []
    }
  }

  componentDidMount() {
    const { params } = this.props.navigation.state
    return fetch(ENDPOINT + '/shareholder/getAllMyEnergySystemIncomes', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yourAddress: params.shareholderAddress
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          incomes: responseJson
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
        <Text style={Styles.baseText4}>Incomes for Token:</Text>
        <FlatList style={Styles.list}
          data={this.state.incomes}
          renderItem={({item}) => 
            <Text style={Styles.item} title={'Timestamp: ' + item.timestamp + ' Income: ' + item.income}/>
          }
        />
      </View>
    );
  }
}

class ShareholderEnergySystemToken extends React.Component {
  static navigationOptions = {
    title: "EnergySystemToken Details",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props)
    const { params } = props.navigation.state
    let transferValueList  = []
    for (var i = 1; i <= params.energySystemToken.balance; i++) {
      transferValueList.push(i)
    }
    this.state = {
      isLoading: false,
      transferToList: [],
      transferValueList: transferValueList,
      transferTo: null,
      transferValue: null
    }
  }

  componentDidMount() {
    // fetch all accounts
    return fetch(ENDPOINT + '/general/getAllAccounts')
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          transferToList: responseJson.accounts
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

  onTransfer(to, value) {
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

    // -> request new insurance
    this.setState({
      isLoading: true
    }, () => {
      return fetch(ENDPOINT + '/energysystemtoken/transfer', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yourAddress: params.energySystemToken.estoken,
          from: params.shareholderAddress,
          to: to,
          value: value
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
            'Tokens transfered!',
            [
              {text: 'OK', onPress: () => navigate('InsurantHome')}
            ],
            { cancelable: false }
          )
          navigate('ShareholderHome')
        })
      })
      .catch((error) => {
        console.log(error)
        this.setState({
          isLoading: false
        }, () => {
          Alert.alert(
            'Error',
            'Tokens could not be transfered! Please try again.',
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
        <Text style={Styles.baseText4}>Transfer To:</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               onValueChange={(transferTo) => this.setState({transferTo})}>
              {this.state.transferToList.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Text style={Styles.baseText4}>Value:</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               onValueChange={(transferValue) => this.setState({transferValue})}>
              {this.state.transferValueList.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Button style={Styles.item} onPress={() => this.onTransfer(this.state.transferTo, this.state.transferValue)} title={'Transfer Tokens'}/>
        <Button style={Styles.item} onPress={() => navigate('ShareholderTokenTransactions', { energySystemToken: params.energySystemToken, shareholderAddress: params.shareholderAddress })} title={'Transaction History'}/>
      </View>
    );
  }
}

class ShareholderTokenTransactions extends React.Component {
  static navigationOptions = {
    title: "ShareholderTokenTransactions",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      incomes: []
    }
  }

  componentDidMount() {
    const { params } = this.props.navigation.state
    return fetch(ENDPOINT + '/shareholder/getAllMyEnergySystemIncomes', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yourAddress: params.shareholderAddress,
          estoken: params.energySystemToken.estoken
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          incomes: responseJson
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
        <Text style={Styles.baseText4}>Incomes for Token:</Text>
        <FlatList style={Styles.list}
          data={this.state.incomes}
          renderItem={({item}) => 
            <Text style={Styles.item} title={'Timestamp: ' + item.timestamp + ' Income: ' + item.income}/>
          }
        />
      </View>
    );
  }
}

class EnergySupplierHome extends React.Component {
  static navigationOptions = {
    title: "EnergySupplier Home",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      balance: 0,
      energySystemTokens: []
    }
  }

  componentDidMount() {
    const { params } = this.props.navigation.state
    return fetch(ENDPOINT + '/general/getKwhTokenBalance', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: params.energySupplierAddress
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          balance: responseJson.balance
        }, () => {
          return fetch(ENDPOINT + '/energysupplier/getEstokensByEnergySupplier', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              yourAddress: params.energySupplierAddress
            })
          })
          .then((response) => response.json())
          .then((responseJson) => {
            console.log(responseJson)
            this.setState({
              isLoading: false,
              energySystemTokens: responseJson
            });
          })
          .catch((error) => {
            console.log(error);
            this.setState({
              isLoading: false
            }, function() {
              Alert.alert(
                'Error',
                'An error occured while fetching all energy system tokens! Please try again in a few seconds.',
                [
                  {text: 'OK', onPress: () => console.log('OK Pressed')}
                ],
                { cancelable: false }
              )
            });
          });
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isLoading: false
        }, function() {
          Alert.alert(
            'Error',
            'An error occured while fetching kwh token balance! Please try again in a few seconds.',
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
        <Text style={Styles.baseText1}>Energy Amount:</Text>
        <Text style={Styles.baseText3}>{this.state.balance}</Text>
        <Text style={Styles.baseText4}>Beteiligungen:</Text>
        <FlatList style={Styles.list}
          data={this.state.energySystemTokens}
          renderItem={({item}) => 
            <Button style={Styles.item} onPress={() => navigate('EnergySupplierEnergySystemToken', { energySystemToken: item, energySupplierAddress: params.energySupplierAddress, balance: this.state.balance })} title={'EnergySystemToken: ' + item.estoken + ' Share: ' + item.balance}/>
          }
        />
        <Button style={Styles.item} onPress={() => navigate('EnergySupplierEnergySystemTokenNeu', { energySupplierAddress: params.energySupplierAddress })} title={'New Token'}/>
        <Button style={Styles.item} onPress={() => navigate('EnergySupplierTransactions', { energySupplierAddress: params.energySupplierAddress })} title={'All Transactions'}/>
      </View>
    );
  }
}

class EnergySupplierTransactions extends React.Component {
  static navigationOptions = {
    title: "EnergySupplierTransactions",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      disburses: []
    }
  }

  componentDidMount() {
    const { params } = this.props.navigation.state
    return fetch(ENDPOINT + '/energysupplier/getDisbursesPerESToken')
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          disburses: responseJson
        })
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isLoading: false
        }, function() {
          Alert.alert(
            'Error',
            'An error occured while fetching all disburses! Please try again in a few seconds.',
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
        <Text style={Styles.baseText4}>All Disburses:</Text>
        <FlatList style={Styles.list}
          data={this.state.disburses}
          renderItem={({item}) => 
            <Text style={Styles.item} title={'Timestamp: ' + item.timestamp + ' Income: ' + item.disburseAmount}/>
          }
        />
      </View>
    );
  }
}

class EnergySupplierEnergySystemToken extends React.Component {
  static navigationOptions = {
    title: "EnergySupplierEnergySystemToken",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props)
    const { params } = props.navigation.state
    let disburseValueList  = []
    for (var i = 1; i <= params.balance; i++) {
      disburseValueList.push(i)
    }
    this.state = {
      isLoading: false,
      disburseValueList: disburseValueList,
      disburseValue: null
    }
  }

  onDisburse(disburseValue) {
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

    // -> request new insurance
    this.setState({
      isLoading: true
    }, () => {
      return fetch(ENDPOINT + '/energysupplier/disburse', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estoken: params.energySystemToken.estoken,
          value: disburseValue
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
            'Tokens disbursed!',
            [
              {text: 'OK', onPress: () => navigate('InsurantHome')}
            ],
            { cancelable: false }
          )
          navigate('EnergySupplierHome')
        })
      })
      .catch((error) => {
        console.log(error)
        this.setState({
          isLoading: false
        }, () => {
          Alert.alert(
            'Error',
            'Tokens could not be disbursed! Please try again.',
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
        <Text style={Styles.baseText4}>Value:</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
               onValueChange={(disburseValue) => this.setState({disburseValue})}>
              {this.state.disburseValueList.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Button style={Styles.item} onPress={() => this.onDisburse(this.state.disburseValue)} title={'Disburse Tokens'}/>
        <Button style={Styles.item} onPress={() => navigate('EnergySupplierTokenTransactions', { energySystemToken: params.energySystemToken, energySupplierAddress: params.energySupplierAddress })} title={'Transaction History'}/>
      </View>
    );
  }
}

class EnergySupplierTokenTransactions extends React.Component {
  static navigationOptions = {
    title: "EnergySupplierTokenTransactions",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      disburses: []
    }
  }

  componentDidMount() {
    const { params } = this.props.navigation.state
    return fetch(ENDPOINT + '/energysupplier/getDisbursesPerESToken', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estoken: params.energySystemToken.estoken
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          disburses: responseJson
        })
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isLoading: false
        }, function() {
          Alert.alert(
            'Error',
            'An error occured while fetching all disburses! Please try again in a few seconds.',
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
        <Text style={Styles.baseText4}>All Disburses:</Text>
        <FlatList style={Styles.list}
          data={this.state.disburses}
          renderItem={({item}) => 
            <Text style={Styles.item} title={'Timestamp: ' + item.timestamp + ' Income: ' + item.disburseAmount}/>
          }
        />
      </View>
    );
  }
}

class EnergySupplierEnergySystemTokenNeu extends React.Component {
  static navigationOptions = {
    title: "EnergySupplierEnergySystemTokenNeu",
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: 'blue', 
      elevation: null,
    }
  }

  constructor(props) {
    super(props)
    const { params } = props.navigation.state
    this.state = {
      isLoading: false,
      accounts: [],
      selectedAccounts: []
    }
  }

  componentDidMount() {
    // fetch all accounts
    return fetch(ENDPOINT + '/general/getAllAccounts')
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          accounts: responseJson.accounts
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

  onCreate(shareholders, tokenAmount) {
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

    // -> request new insurance
    this.setState({
      isLoading: true
    }, () => {
      return fetch(ENDPOINT + '/energysupplier/createESToken', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estoken: params.energySupplierAddress,
          shareholders: shareholders,
          tokenAmount: tokenAmount
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
            'Token created!',
            [
              {text: 'OK', onPress: () => navigate('InsurantHome')}
            ],
            { cancelable: false }
          )
          navigate('EnergySupplierHome')
        })
      })
      .catch((error) => {
        console.log(error)
        this.setState({
          isLoading: false
        }, () => {
          Alert.alert(
            'Error',
            'Tokens could not be created! Please try again.',
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
        <Text style={Styles.baseText4}>Add Shareholder:</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <Picker style={Styles.picker2}
                onValueChange={(shareholder) => {
                  let selectedAccounts = this.state.selectedAccounts
                  selectedAccounts.push(shareholder)
                  this.setState({selectedAccounts})
                }}>
              {this.state.accounts.map((i) => {
                return <Picker.Item key={i} value={i} label={i}/>
              })}
            </Picker>
          </View>
        </View>
        <Button style={Styles.item} onPress={() => this.onCreate(this.state.selectedAccounts, 100)} title={'Create Token'}/>
      </View>
    );
  }
}

export default App = StackNavigator({
  Login: { screen: Login },
  ShareholderHome: { screen: ShareholderHome },
  ShareholderPayOutTokens: { screen: ShareholderPayOutTokens },
  ShareholderSendTokens: { screen: ShareholderSendTokens },
  ShareholderTransactions: { screen: ShareholderTransactions },
  ShareholderEnergySystemToken: { screen: ShareholderEnergySystemToken },
  ShareholderTokenTransactions: { screen: ShareholderTokenTransactions },
  EnergySupplierHome: { screen: EnergySupplierHome },
  EnergySupplierTransactions: { screen: EnergySupplierTransactions },
  EnergySupplierEnergySystemToken: { screen: EnergySupplierEnergySystemToken },
  EnergySupplierTokenTransactions: { screen: EnergySupplierTokenTransactions },
  EnergySupplierEnergySystemTokenNeu: { screen: EnergySupplierEnergySystemTokenNeu }
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
