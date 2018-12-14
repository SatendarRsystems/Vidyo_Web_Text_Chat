import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import config from '../../config';
import string_constant from '../constant/message_constant';



// After the VidyoClient is successfully initialized a global VC object will become available
declare var VC: any;
// library to generate auth token
declare var jsSHA: any;

@Injectable({
    providedIn: 'root'
})
export class VidyoClientService {
    vidyoConnector;   // Vidyo connector object
    userName;         // user Name
    meetingRoom;      // Meeting Room Name
    hostName;         // host Name
    token;            // Vidyo token
    users;            // Array of users present in meeting room

    // Observers //
    private sdkLoadSubject = new Subject<any>();
    // Observable for Vidyo SDK Load Event
    sdkLoadConfirmed$ = this.sdkLoadSubject.asObservable();

    private joinMeetingSubject = new Subject<any>();
    // Observable for user joined the meeting room
    meetingJoinedConfirmed$ = this.joinMeetingSubject.asObservable();

    private messageSendRecievedSubject = new Subject<any>();
    // Observable for chat message recieve and send
    messageSendRecievedConfirmed$ = this.messageSendRecievedSubject.asObservable();


    /**
    * Description: Constructor of vidyo-client service
    * @param object  Router
    */
    constructor(public router: Router) {
        /* Exposing onVidyoClientLoaded method to outside angular zone */
        window['onVidyoClientLoaded'] = (status) => {
            this.sdkLoadSubject.next(status);
        };

        // Intialize users to empty array
        this.users = [];
    }

    /**
    * Description: Load vidyo library.
    * This method create a script tag with source pointing to vidyo library and add append this script tag into head of application
    */
    loadVidyoSDK = () => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = config.VIDYO_LIB;
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    /**
    * Description: Set login variables.
    * @param string userName
    * @param string meetingRoom
    * @param string meetingRomm    
    * @param string token      
    */
    setData = (userName, meetingRoom , hostName, token) => {
        this.userName = userName.trim();
        this.meetingRoom = meetingRoom.trim();
        this.hostName = hostName.trim();
        this.token = token.trim();
    }

    /**
    * Description: Register the message listener.This listner listen for message receive event
    */
    registerMessageListener = () => {
        // Register Message event listener
        this.vidyoConnector.RegisterMessageEventListener({
            onChatMessageReceived: (participant, chatMessage) => {
                // Recieved New Message
                if (chatMessage.userId !== 'local') {
                    const jsonObject = JSON.parse(chatMessage.body);
                    const userBgColor = this.getUserBgColor(participant.name);
                    const mItem = { isUser: false, data: jsonObject, username: participant.name, userBgColor: userBgColor };
                    this.messageSendRecievedSubject.next(mItem);
                }
            }
        }).then(() => {
            console.log('RegisterMessageEventListener Success');
        }).catch(() => {
            console.log('RegisterMessageEventListener Failed');
        });
    }

    /**
    * Description: get the background color of user
    * @param string userName
    * @return string bgColor
    */
    getUserBgColor = (userName) => {
        const user = this.users.find((item) => {
            return item.name === userName;
        });
        return user.bgColor;
    }

    /**
    * Description: Create Vidyo connector
    */
    initVidyoConnector = () => {
        VC.CreateVidyoConnector({
            viewId: null, // Div ID where the composited video will be rendered, see VidyoConnector.html;
            viewStyle: 'VIDYO_CONNECTORVIEWSTYLE_Default', // Visual style of the composited renderer
            remoteParticipants: 8,     // Maximum number of participants to render
            logFileFilter: 'warning info@VidyoClient info@VidyoConnector',
            logFileName: '',
            userData: '',
        }).then((vc) => {
            this.vidyoConnector = vc;
            this.handleParticipantChangeListener();
            this.registerMessageListener();
            this.joinRoom();
        }).catch((err) => {
            const status = {
                type: string_constant.ERROR,
                data: err
            };
            this.joinMeetingSubject.next(status);
        });
    }

    /**
    * Description: Register the participant change listener.
    */
    handleParticipantChangeListener = () => {
        this.vidyoConnector.RegisterParticipantEventListener({
            // Define handlers for participant change events.
            onJoined: (participant) => {
                // participant Joined
                console.log('[vc] participant onJoined= ' + JSON.stringify(participant));
                this.addUser(participant);
            },
            onLeft: (participant) => {
                // participant Left
                console.log('[vc] participant onLeft= ' + JSON.stringify(participant));
                this.removeUser(participant);
            },
            onDynamicChanged: (participants) => {
                console.log('[vc] participant onDynamicChanged= ' + JSON.stringify(participants));
            },
            onLoudestChanged: (participant, audioOnly) => {
                // participant talking
                participant.audioOnly = audioOnly;
                console.log('[vc] participant onLoudestChanged= ' + JSON.stringify(participant));
                console.log('[vc] participant onLoudestChanged audioOnly= ' + JSON.stringify(audioOnly));
            }
        }).then(() => {
            console.log('[vc] RegisterParticipantEventListener Success');
        }).catch(() => {
            console.error('[vc] RegisterParticipantEventListener Failed');
        });
    }

    /**
    * Description: Generate random color code.
    * @return string color
    */
    getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /**
    * Description: Add user in users array object.
    * @param Object user
    */
    addUser = (user) => {
        user.bgColor = this.getRandomColor();
        user.firstChar = user.name.substr(0, 1).toUpperCase();
        this.users.push(user);
    }

    /**
    * Description: remove user from users array object.
    * @param Object user
    */
    removeUser = (user) => {
        this.users = this.users.filter((item) => {
            return item.id !== user.id;
        });
    }

    /**
    * Description: connect to the conference.
    * @param string token
    * @param string userName
    * @param string meetingRoom
    */
    joinRoom = () => {
        if (this.meetingRoom.indexOf(' ') !== -1 || this.meetingRoom.indexOf('@') !== -1) {
            console.error('Connect meeting aborted due to invalid Resource ID');
            const status = {
                type: string_constant.FALIURE,
                data: string_constant.INVALID_RESOURCE_ID
            };
            this.joinMeetingSubject.next(status);
            return;
        }
        this.vidyoConnector.Connect({
            // Take input from options form
            host: this.hostName,
            token: this.token,
            displayName: this.userName,
            resourceId: this.meetingRoom,

            // Define handlers for connection events.
            onSuccess: () => {
                // Connected
                console.log('vidyoConnector.Connect : onSuccess callback received');
                const selfId = { name: this.userName + '(You)' };
                this.addUser(selfId);
                const status = {
                    type: string_constant.SUCESS,
                    data: string_constant.NONE
                };
                this.joinMeetingSubject.next(status);
            },
            onFailure: (reason) => {
                // Failed
                console.error('vidyoConnector.Connect : onFailure callback received');
                const status = {
                    type: string_constant.FALIURE,
                    data: reason
                };
                this.joinMeetingSubject.next(status);
            },
            onDisconnected : (reason) => {
                // Disconnected
                console.log('vidyoConnector.Connect : onDisconnected callback received');
                const status = {
                    type: string_constant.DISCONNECTED,
                    data: reason
                };
                this.joinMeetingSubject.next(status);
            }
        }).then((status) => {
            if (status) {
                console.log('[vc] Connect Success');

            } else {
                console.error('[vc] Connect Failed');
            }
        }).catch(() => {
            const status = {
                type: string_constant.FAILED,
                data: ''
            };
            this.joinMeetingSubject.next(status);
        });
    }

    /**
    * Description: function to broadcast the entered message from the user
    */
    sendChatMsg = (chatMessage) => {
        const message = '{ "type": "PublicChat",' +
            '"message": "' + chatMessage + '" }';
        this.vidyoConnector.SendChatMessage({ message });
        const userBgColor = this.getUserBgColor(this.userName + '(You)');
        const messageData = {
            message: chatMessage
        };
        const mItem = { isUser: true, data: messageData, username: this.userName, userBgColor: userBgColor };
        this.messageSendRecievedSubject.next(mItem);
    }

    /**
    * Description: function to logout from confrence
    */
    logout = () => {
        const redirect = '/login';
        this.vidyoConnector.Disconnect().then(() => {
            this.users = [];
            this.router.navigate([redirect]);
        }).catch(() => {
            this.users = [];
            this.router.navigate([redirect]);
        });
    }
}
