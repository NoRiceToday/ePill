import React from "react";
import {sha256} from "js-sha256";
import axios from "axios";
import {toast} from "react-toastify";
import {translate} from "react-i18next";

class connectA7Popup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            sending: '',
            a7id: ''
        };

        this.options = toast.POSITION.BOTTOM_CENTER;

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.sendConnectionToBackend = this.sendConnectionToBackend.bind(this);

    }

    handleUsernameChange(event) {
        this.setState({username: event.target.value});
    }

    handlePasswordChange(event) {
        this.setState({password: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.state.sending = true;
        this.setState(this.state);
        const {t} = this.props;

        const url = 'https://sandbox.andaman7.com/public/v1/users/me';
        const apiKey = '0a24fa4b-9f38-47a4-ad99-5ba3a2c211c1';
        const hashedPw = sha256(this.state.password);
        let credentials = this.state.username + ":" + hashedPw;
        let credString = 'Basic ' + window.btoa(credentials);

        axios({
            url: url,
            method: 'get',
            headers: {
                'api-key': apiKey,
                'Authorization': credString
            }
        })
            .then(({data}) => {
                    this.state.sending = false;
                    this.state.a7id = data.id;
                    console.log(this.state.a7id);
                    this.setState(this.state);

                    //save connection in the backend
                    this.sendConnectionToBackend();

                },
                (error) => {
                    this.setState({sending: false, error: true});
                    toast.error(t('loginFailed'), this.options);
                }
            );
    }

    registerForService() {
        //This code is used to register a User to my service
        const deviceId = "21002c41-c430-4043-9511-a5c527869b2c";
        const patientMail = this.state.username;
        const connectorMail = "testmailforepill@gmail.com";
        const url = 'https://test-server.andaman7.com/public/v1/services/register';
        const apiKey = '0a24fa4b-9f38-47a4-ad99-5ba3a2c211c1';
        const hashedPw = sha256("thirdPartyAccountService");
        let credentials = connectorMail + ":" + hashedPw;
        let credString = 'Basic ' + window.btoa(credentials);

        //sending request to backend
        this.state.sending = true;
        this.setState(this.state);

        axios({
            url: url,
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Authorization': credString,
                'Content-Type': 'application/json',
                'device-id': deviceId
            },
            data: {	//the body of the request
                'firstName': this.props.firstName,
                'lastName': this.props.lastName,
                'email': patientMail,
                'language': 'EN',
                'externalUserId': patientMail,
                'serviceId': 'partner.com.epill',
                'scenarioId': 'partnerscenario.com.epill.poc'
            }
        }).then(({data}) => {
                this.state.sending = false;
                this.state.showConfirmButton = true;
                this.setState(this.state);
            },
            (error) => {
                this.state.sending = false;
                this.setState(this.state);
                console.log("something went wrong");
                console.log(error);
            }
        );
    }

    sendConnectionToBackend() {
        const {t} = this.props;
        //sending request to backend
        this.state.sending = true;
        this.setState(this.state);
        axios.post('/user/connect/a7', this.state, {
            // We allow a status code of 401 (unauthorized). Otherwise it is interpreted as an error and we can't
            // check the HTTP status code.
            validateStatus: (status) => {
                return (status >= 200 && status < 300) || status == 401
            }
        }).then(({data, status}) => {
            this.state.sending = false;
            this.setState(this.state);
            switch (status) {
                case 200:
                    toast.success(t('connectSuccess'), this.options);
                    this.props.closeModal();
                    break;
                case 401:
                    this.setState({error: true});
                    toast.error(t('connectFail'), this.options);
                    break;
            }
        });
    }

    render() {
        const {t} = this.props;

        return (
            <div>
                <div>
                    {/* Popup content */}
                    <h2>{t("loginForA7")}</h2>
                    <p> {t("connectExplanation")}</p>
                    <form onSubmit={this.handleSubmit}
                          className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-0 col-lg-4 col-lg-offset-0 column">
                        <div className="form-group">
                            <label htmlFor="username">{t('username')}</label>
                            <input type="text" name="username" id="username" className="form-control"
                                   value={this.state.username} onChange={this.handleUsernameChange}/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">{t('password')}</label>
                            <input type="password" name="password" id="password" className="form-control"
                                   value={this.state.password} onChange={this.handlePasswordChange}/>
                        </div>
                        {!this.state.sending ?
                            <button type="submit" className="btn btn-primary">Login</button>
                            : <button className="btn btn-default"><img
                                src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="></img>
                            </button>}
                        {this.state.showConfirmButton ?
                            <button onClick={this.sendConnectionToBackend}> {t("confirmedConnection")} </button> : null}
                    </form>
                </div>
            </div>)
    }
}

export default translate()(connectA7Popup);