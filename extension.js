const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Tweener = imports.ui.tweener;
const Soup = imports.gi.Soup;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;

let button;

const CavsPanelButton = new Lang.Class({
    Name: "CavsPanelButton",
    Extends: PanelMenu.Button,

    _init: function() {
        var self = this;
        this.parent(0.0, "Cavs Panel Button", false);

        let path = Me.path + "/img/cleveland-cavs.png";
        let file = Gio.File.new_for_path(path);

        let icon = new St.Icon({
            style_class: 'cavs-icon',
            gicon: Gio.FileIcon.new(file)
        });

        this.actor.add_actor(icon);
        let teams = this.teams;
        let that = this;
        this._getGames(function(games) {
            games.forEach(function(game) {
                let menuItem = new PopupMenu.PopupMenuItem(game.gameId);
                that.menu.addMenuItem(menuItem);


            });
        });
    },

    _getGames: function(callback) {
        let url = 'http://data.nba.net/prod/v1/2017/teams/cavaliers/schedule.json';

        var request = Soup.Message.new('GET', url);

        var session = new Soup.SessionAsync();
        var that = this;
        session.queue_message(request, function(session, message) {
            //global.log(message.response_body.data);
            let data = JSON.parse(message.response_body.data);
            let games = data.league.standard;
            callback(games);
            //Mainloop.quit();
        });
    },

    get teams() {
        let path = Me.path + "/data/teams.json";
        let [result, contents] = GLib.file_get_contents(path);
        if (!result) {
            return false;
        }

        let json = JSON.parse(contents);
        let teams = json.league.standard;
        return teams;
    }
});

function _showSchedule() {
    global.log('showing schedule');
    let menuItem = new PopupMenu.PopupBaseMenuItem();

    button.menu.addMenuItem(menuItem);
}

function init() {
    button = new CavsPanelButton();
}

function enable() {
    Main.panel.addToStatusArea('cavs-button', button);
}

function disable() {
    button.destroy();
}
