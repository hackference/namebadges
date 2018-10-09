require('dotenv').load({ silent: true });
const Express = require('express');
const BodyParser = require('body-parser');
const Debug = require('debug');
const Knex = require('knex')(require('./knexfile')[process.env.NODE_ENV]);
const Cloudinary = require('cloudinary');
const Gravatar = require('gravatar');
const Axios = require('axios');
const Md5 = require('md5');

// Configure logger
const logger = {
    info: Debug('namebadge:info'),
    error: Debug('namebadge:error'),
}

// Configure Express
const App = Express();
App.set('view engine', 'ejs');
App.use(BodyParser.urlencoded({ extended: false }))
App.use(BodyParser.json())

// The routes!
App.get('/', (req, res) => {
    res.render('index', {
        ticket: '',
        email: '',
        warning: '',
    })
});
App.post('/', (req, res) => {
    const { ticket, email } = req.body;

    Knex.select('id')
        .from('tickets')
        .where({
            ticket,
            email,
        })
        .then(result => {
            if (result.length) {
                const { id } = result.pop();
                res.redirect(`/namebadge/${id}`);
            } else {
                res.render('index', {
                    ticket,
                    email,
                    warning: 'No ticket match found',
                })
            }
        })
        .catch(error => {
            logger.error(error);
            res.statusCode(500);
        })
})
App.get('/namebadge/:id', (req, res) => {
    const { id } = req.params;

    Knex.select('ticket', 'email', 'fullname', 'company')
        .from('tickets')
        .where({
            id
        })
        .then(result => {
            if (!result.length) {
                res.statusCode(404);
            } else {
                const { ticket, email, fullname, company } = result.pop();
                Cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_KEY,
                    api_secret: process.env.CLOUDINARY_SECRET
                });
                const cloudinaryPublicId = `hackference-2018-namebadges/${ticket.toLowerCase()}`
                Cloudinary.v2.api.resource(cloudinaryPublicId, (error, result) => {
                    if(!result) {
                        const gravatarProfileUrl = Gravatar.profile_url(email, { protocol: 'https' });
                        let gravatarUrl = ''
                        Axios.head(gravatarProfileUrl)
                            .then(result => {
                                gravatarUrl = Gravatar.url(email, { protocol: 'https', s: 250 });
                            })
                            .catch(error => {
                                gravatarUrl = `https://i2.wp.com/starwavatars.global.ssl.fastly.net/avatars/${Md5(email)}.png?ssl=1`
                            })
                            .then(() => {
                                return new Promise((resolve, reject) => {
                                    Cloudinary.v2.uploader.upload(gravatarUrl, { public_id: cloudinaryPublicId },
                                    (error, result) => { 
                                        if (error) reject(error)
                                        resolve(result);
                                     });
                                })
                            })
                    }
                    console.log(result)
                    const bWidth = 1050;
                    const bHeight = 1480;
                    const shrinkRatio = 0.54;
                    const background = `b_rgb:52c3ef,c_crop,e_colorize:100,h_${bHeight},o_10,w_${bWidth}/c_crop,e_grayscale,h_${bHeight},l_hackference-2018:hackference-flag,o_10,w_${bWidth}/c_scale,w_${bWidth * shrinkRatio}`;
                    const attendeeImage = `l_hackference-2018-namebadges:${ticket.toLowerCase()},r_10,w_170,y_-150,bo_2px_solid_white`;
                    const attendeeName = `w_${Math.floor(bWidth * shrinkRatio * 0.9)},c_fit,l_text:Arial_50_bold:${encodeURIComponent(fullname)},co_rgb:FFFFFF,y_20`
                    // const companyName = `l_text:Arial_35_bold:${encodeURIComponent(company)},co_rgb:FFFFFF,y_100`
                    const hackferenceLogo = `l_hackference-white_tybqah,w_${Math.floor(bWidth*shrinkRatio*0.9)},y_250`;
                    const cloudinaryWatermark = `g_south,l_cloudinary_logo,y_-10,w_${Math.floor(bWidth*shrinkRatio*0.60)}`;
                    const nameBadge = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${background}/${attendeeImage}/${attendeeName}/${hackferenceLogo}/${cloudinaryWatermark}/hackference-2018/hackference-flag.png`;

                    res.render('namebadge',{ ticket, email, fullname, company, nameBadge })
                });
            }
        })
});

// Listen for requests
const port = process.env.PORT || 8000;
App.listen(port, () => logger.info(`Listening on port ${port}`))
