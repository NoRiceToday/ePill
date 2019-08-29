import axios from "axios";
import React from "react";

import {translate} from "react-i18next";
import {toast} from 'react-toastify';

import {withCookies} from "react-cookie";
import {sha256} from "js-sha256";

class a7Popup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sending : '',
            tpaId : '',
            service: 'A7',
            password : '',
            email: '',
            firstName: '',
            lastName: '',
            error: ''
        };

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.options = toast.POSITION.BOTTOM_CENTER;
        this.cookies = this.props.cookies;
    }

    handleUsernameChange(event) {
        this.setState({tpaId: event.target.value});
    }

    handlePasswordChange(event) {
        this.setState({password: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.state.sending = true;
        this.setState(this.state);

        const url = 'https://sandbox.andaman7.com/public/v1/users/me';
        const apiKey = '0a24fa4b-9f38-47a4-ad99-5ba3a2c211c1';
        const hashedPw = sha256(this.state.password);
        let credentials = this.state.tpaId + ":" + hashedPw;
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
                //TODO: Fehlerbehandlung. get gender, rot-grün-schwäche...
                //TODO: Account creation itself should be on the backend, right?
                    this.state.sending = false;
                    this.setState(this.state);

                    const {t} = this.props;

                    console.log(data);
                    console.log("Now, lets see if I can get the correct entries:");
                    const id = data.id;
                    const {lastName: lastName, firstName: firstName} = data.administrative;
                    const mail = data.mail;
                    let path = this.props.location.pathname;
                    console.log(path);
                    //sending request to backend
                /*
                    axios.post('/auth/a7Login', this.state, {
                        // We allow a status code of 401 (unauthorized). Otherwise it is interpreted as an error and we can't
                        // check the HTTP status code.
                        validateStatus: (status) => {
                            return (status >= 200 && status < 300) || status == 401
                        }
                    })
                */
                },
                (error) => {
                    console.log(error);
                    const {t} = this.props;
                    this.setState({error: true});
                    toast.error(t('loginFailed'), this.options);
                }
            );
        this.state.sending = false;
        this.setState(this.state);
    }


    render() {
        const {t} = this.props;

        return (
            <div>
                <div>
                    {/* Popup content */}
                    <h2>Login für Andaman7</h2>

                    <form onSubmit={this.handleSubmit} className="col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-0 col-lg-4 col-lg-offset-0 column">
                        <div className="form-group">
                            <label htmlFor="username">{t('username')}</label>
                            <input type="text" name="username" id="username" className="form-control" value={this.state.username} onChange={this.handleUsernameChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">{t('password')}</label>
                            <input type="password" name="password" id="password" className="form-control" value={this.state.password} onChange={this.handlePasswordChange} />
                        </div>
                        {!this.state.sending ?
                            <button type="submit" className="btn btn-primary">Login</button>
                            : <button className="btn btn-default"><img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="></img></button> }

                    </form>
                </div>
            </div>)
    }
}

export default withCookies(translate()(a7Popup))