/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { TPStreams } from 'react-native-tpstreams';

TPStreams.initialize('9q94nm');
AppRegistry.registerComponent(appName, () => App);
