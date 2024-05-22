//take all the slices that we are creating (combined all the reducers)
import storage from "redux-persist/lib/storage";
import appReducer from './slices/app';
import conversationReducer from "./slices/conversation";
import app2Reducer from './slices/groupe'
import conversationnReducer from "./slices/conversationGroup";
import socketIdSlice from "./slices/socketId";
//slices
import { combineReducers } from "redux"; 

//create root configuration (how data store and how read out data from store)
const rootPersistConfig = {
    key:'root',
    storage,
    keyPrefix: 'redux-'
    // whitelist:[],
    // blacklist:[]
}

//create combine reducer
const rootReducer = combineReducers({
    app2: app2Reducer,
    conversation: conversationReducer,
    conversationn: conversationnReducer,
    app: appReducer,
    socketId: socketIdSlice
    
});

export {rootPersistConfig, rootReducer}