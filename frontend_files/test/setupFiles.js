import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;
require('mock-require')('react-toastify/dist/ReactToastify.css', {});