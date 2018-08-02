import { observable, action } from 'mobx';
import axios from 'axios';
import { message } from 'antd';

import jwtDecode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';

// warning message configuration
message.config({
  top: 100,
  duration: 4,
  maxCount: 3
});

class AuthStore {
  @observable registerLoading = false;
  @observable registerErrors = {};
  // errors and warnings are the same but we clear warnings after displaying one but errors persist
  // TODO: make sure you can't try to register if you are logged in

  // if the errors objects has anything in it, show an error message and then clear errors

  // if there are any errors this function is called with an array of errors
  // for each one with display an error, but it is set up to only really show one at a time at backend currently
  @action
  displayWarnings = errors => {
    errors.forEach(e => message.error(e));
  };

  @action
  registerUser = async data => {
    // reset
    this.registerLoading = true;
    this.registerErrors = false;
    this.user = {};

    try {
      await axios.post('api/users/register', data);
      this.registerLoading = false;
      message.success(
        `Welcome ${data.username}, You have successfully registered.`
      );
    } catch (err) {
      this.registerErrors = err.response.data;
      this.registerLoading = false;
      this.displayWarnings(Object.values(err.response.data));
    }
  };

  // LOGIN
  @observable user = {};
  @observable loginLoading = false;
  @observable loginErrors = {};
  @action
  loginUser = async data => {
    this.registerLoading = true;
    this.user = {};

    try {
      const token = (await axios.post('api/users/login', data)).data;
      this.loginLoading = true;
      localStorage.setItem('jwToken', token);
      setAuthToken(token);
      const decoded = jwtDecode(token);
      this.user = decoded;
      this.loginLoading = false;
      message.success(
        `Successfully logged in as ${this.user.username}, welcome!`
      );
    } catch (err) {
      console.log(err.response);
      this.loginErrors = err.response.data;
      this.loginloading = false;
      this.displayWarnings(Object.values(err.response.data));
    }
  };
}

export default new AuthStore();
