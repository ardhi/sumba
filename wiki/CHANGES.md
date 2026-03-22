# Changes

## 2026-03-22

- [2.12.0] Add no route settings sitewise
- [2.12.0] Add no route settings for teams
- [2.12.0] Some organizatorial changes in module files

## 2026-03-22

- [2.11.0] Add ```Team Setting``` feature
- [2.11.0] Rewrite ```getUser()```
- [2.11.0] Rewrite ```getSite()```
- [2.11.0] Bug fix in model reference not displayed correctly on ```Details View```
- [2.11.1] Bug fix in ```parseNsSetting()```

## 2026-03-13

- [2.10.0] ```getSite()``` now accept object & array based on their keys to

## 2026-03-12

- [2.9.0] Add ability to restrict/filter dobo's records through site setting
- [2.9.0] Multisite config now accept object. If set to ```true``` it defaults to ```catchAll: 'default'```

## 2026-03-11

- [2.8.0] Add ```createNewSite()``` and ```applet.crateNewSite```
- [2.8.0] Add ```removeSite()``` and ```applet.removeSite```
- [2.8.0] Set ```site.json```, ```user.json```, ```team.json```, ```team-user.json``` first fixture as immutable row
- [2.8.1] Bug fix in ```createNewSite()```

## 2026-03-08

- [2.7.3] Bug fix on ```mergeTeam()```

## 2026-03-07

- [2.7.1] Bug fix on ```site``` attachment
- [2.7.1] Bug fix on ```getUserFromUsernamePassword()```

## 2026-03-05

- [2.6.0] Update multiple endpoints to support dobo's transaction
- [2.6.0] Bug fix on ```profile.edit``` route
- [2.7.0] Add hook ```sumba:afterCollectSecureRoutes```
- [2.7.0] Add hook ```sumba:afterCollectAnonymousRoutes```
- [2.7.0] Add hook ```sumba:afterCollectTeamRoutes```

## 2026-03-02

- [2.5.0] Add ```sendMail()``` to send mail using ```masohiMail```
- [2.5.0] Update all mail templates and hooks to match with the new specs

## 2026-02-21

- [2.4.1] Bug fix on intl functions. Now moved to ```preParsing``` instead of ```onRequest```

## 2026-02-20

- [2.4.0] Add ```getCountriesValues()```
- [2.4.0] Update ```sumba:country``` feature to use ```prop.values``` as a handler
- [2.4.0] No longer use the removed ```FormSelectCountry```, instead use ```FormSelectExt```

## 2026-02-17

- [2.3.0] Add admin menu links to ```siteSetting```
- [2.3.0] Bug fix on ```getSite()```
- [2.3.0] Add unique index on model ```SumbaSiteSetting```
- [2.3.0] Add admin subroute to manage site setting
- [2.3.0] Bug fix on ```req.theme``` and ```req.iconset``` resolver
- [2.3.1] Update translations
- [2.3.1] Bug fix on ```sumba:country``` feature

## 2026-02-09

- [2.2.3] Bug fix on sidebar menu
- [2.2.4] Bug fix on signout template
- [2.2.4] Bug fix on sidebar buttons

## 2026-02-08

- [2.2.0] Add ```siteSetting.timeZone``` in config object

## 2026-02-06

- [2.1.9] Bug fix on ```getSite()``` for multisite system

## 2026-02-05

- [2.1.8] Bug fix on site update: ```hostname``` should be editable
- [2.1.8] Missing icon on ```account``` menu

## 2026-02-04

- [2.1.7] Add icon to the menu
- [2.1.7] Bug fix on ```<c:nav-dropdown-user>```

## 2026-02-03

- [2.1.6] Bug fix on widget's menu direction

## 2026-01-26

- [2.1.5] Bug fix on feature ```siteId```
- [2.1.5] Bug fix on feature ```userId```

## 2026-01-21

- [2.1.4] Update translations

## 2026-01-18

- [2.1.3] Drop some less necessary dependencies

## 2026-01-17

- [2.1.2] Add theme & iconset check from ```req.headers['x-theme']``` &  ```req.headers['x-iconset']```

## 2026-01-13

- [2.1.1] Bug fix on waibuMpa's widgeting system

## 2026-01-01

- [2.1.0] Ported to match ```bajo@2.2.x``` & ```dobo@2.2.x``` specs
- [2.1.0] Upgrade to ```slug@11.0.1```
