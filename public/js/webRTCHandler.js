import * as wss from './wss.js';
import * as constants from './constants.js'
import * as ui from './ui.js'

let connectedUserDetails;

export const sendPreOffer = (callType,calleePersonalCode) => {
    // console.log('pre offer func executed');
    // console.log(callType);
    // console.log(calleePersonalCode);

    connectedUserDetails = {
        callType,
        socketId: calleePersonalCode,
    }

    if(callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE){
        const data = {
            callType,
            calleePersonalCode
        };
        ui.showCallingDialog(callingDialogRejectCallHandler);
        wss.sendPreOffer(data);
    }
        
};

export const handlePreOffer = (data) => {
    // console.log('pre-offer came webRTC handler');
    // console.log(data);

    const {callType, callerSocketId} = data;
    connectedUserDetails = {
        socketId:callerSocketId,
        callType,
    };

    if(callType == constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE){
        console.log("showing call dialog");
        ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
    }
};

const acceptCallHandler = () => {
    console.log('call accepted');
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType);
}

const rejectCallHandler = () => {
    console.log('call rejected');
    sendPreOfferAnswer();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
}

const callingDialogRejectCallHandler = () => {
    console.log('rejecting the call');
};

const sendPreOfferAnswer = (preOfferAnsweer) => {
    const data = {
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnsweer
    };
    ui.removeAllDialogs();
    wss.sendPreOfferAnswer(data);
}

export const handlePreOfferAnswer = (data) => {
    const { preOfferAnsweer } = data;
    // console.log('pre offer answer came');
    // console.log(data);

    ui.removeAllDialogs();

    if(preOfferAnsweer === constants.preOfferAnswer.CALLEE_NOT_FOUND){
        ui.showInfoDialog(preOfferAnsweer);
        // show dialog that callee has not been found.
    }

    if(preOfferAnsweer === constants.preOfferAnswer.CALL_UNAVAILABLE){
        ui.showInfoDialog(preOfferAnsweer);
        // show dialog that callee is not able to connect.
    }

    if(preOfferAnsweer === constants.preOfferAnswer.CALL_REJECTED){
        ui.showInfoDialog(preOfferAnsweer);
        // show dailog that call is rejected by the callee
    }

    if(preOfferAnsweer === constants.preOfferAnswer.CALL_ACCEPTED){
        ui.showCallElements(connectedUserDetails.callType);
        // send webRTC offer
    }
};