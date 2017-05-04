const express = require('express')
const router = express.Router()

const checkPermissions = require('utils/auth/checkPermission')
const validators = require('./validators')
const getAllJedi = require('./getAllJedi')
const postJedi = require('./postJedi')
const getJedi = require('./getJedi')
const putJedi = require('./putJedi')
const patchJedi = require('./patchJedi')
const deleteJedi = require('./deleteJedi')

router.get('/:id', validators.urlId, checkPermissions('jedi_view'), getJedi)
router.get('/', checkPermissions('jedi_view'), getAllJedi)
router.post('/', checkPermissions('jedi_save'), validators.postJedi, postJedi)
router.put('/:id', checkPermissions('jedi_save'), validators.putJedi, putJedi)
router.patch('/:id', checkPermissions('jedi_save'), validators.patchJedi, patchJedi)
router.delete('/:id', checkPermissions('jedi_delete'), validators.urlId, deleteJedi)

module.exports = router
