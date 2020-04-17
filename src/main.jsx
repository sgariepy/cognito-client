import {Config, CognitoIdentityCredentials} from "aws-sdk";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails
} from "amazon-cognito-identity-js";
import React from "react";
import ReactDOM from "react-dom";
import appConfig from "./config";

Config.region = appConfig.region;
Config.credentials = new CognitoIdentityCredentials({
  IdentityPoolId: appConfig.IdentityPoolId
});

const userPool = new CognitoUserPool({
  UserPoolId: appConfig.UserPoolId,
  ClientId: appConfig.ClientId,
});

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      username: 'unknown',
      verificationCode: '',
      verificationCodeSuccess: 'Not Executed',
      accessToken: '',
      idToken: '',
    };
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value});
  }

  handleVerificationCodeChange(e) {
    this.setState({verificationCode: e.target.value});
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    const email = this.state.email.trim();
    const password = this.state.password.trim();
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      })
    ];
    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('user name is ' + result.user.getUsername());
      this.setState({username: result.user.getUsername()});
      console.log('call result: ' + result);
    });
  }

  handleSubmitVerificationCode(e) {
    e.preventDefault();

    console.log('verifying code...');
    var userData = {
      Username: this.state.username,
      Pool: userPool,
    };

    var cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(this.state.verificationCode.trim(), true, function(err, result) {
      if (err) {
          alert(err.message || JSON.stringify(err));
          return;
      }
      console.log('call result: ' + result);
      this.setState({verificationCodeSuccess: result});
    });

  }

  handleAuthentication(e) {
    e.preventDefault();

    var authenticationData = {
      Username: this.state.email,
      Password: this.state.password,
    };

    var authenticationDetails = new AuthenticationDetails(
      authenticationData
    );

    var userData = {
      Username: this.state.email,
      Pool: userPool,
    };

    var cognitoUser = new CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function(result) {
          var accessToken = result.getAccessToken().getJwtToken();
          var idToken = result.getIdToken().getJwtToken();

          this.setState({accessToken: accessToken});
          this.setState({idToken: idToken});

          AWS.config.region = 'us-east-1';

          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              IdentityPoolId: '', // your identity pool id here
              Logins: {
                  // Change the key below according to the specific region your user pool is in.
                  'cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>': result
                      .getIdToken()
                      .getJwtToken(),
              },
          });

          AWS.config.credentials.refresh(error => {
              if (error) {
                  console.error(error);
              } else {
                  console.log('Successfully logged!');
              }
          });
      }.bind(this),

      onFailure: function(err) {
          alert(err.message || JSON.stringify(err));
      },
    });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <input type="text"
                value={this.state.email}
                placeholder="Email"
                onChange={this.handleEmailChange.bind(this)}/>
          <input type="password"
                value={this.state.password}
                placeholder="Password"
                onChange={this.handlePasswordChange.bind(this)}/>
          <input type="submit"/>
        </form>

        <hr/>
        <p>Username: {this.state.username}</p>
        <hr/>

        <form onSubmit={this.handleSubmitVerificationCode.bind(this)}>
          <input type="text"
                value={this.state.verificationCode}
                placeholder="Verification Code"
                onChange={this.handleVerificationCodeChange.bind(this)}/>
          <input type="submit"/>
        </form>

        <hr/>
        <p>Verification: {this.state.verificationCodeSuccess}</p>
        <hr/>

        <form onSubmit={this.handleAuthentication.bind(this)}>
          <input type="submit" />
        </form>

        <p>AccessToken: {this.state.accessToken}</p>
        <p>IdToken: {this.state.idToken}</p>
      </div>
    );
  }
}

ReactDOM.render(<SignUpForm />, document.getElementById('app'));
