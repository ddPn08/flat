import { app } from 'electron'
import path from 'path'

export const FEATURES_PATH = path.join(app.getPath('userData'), 'features')
