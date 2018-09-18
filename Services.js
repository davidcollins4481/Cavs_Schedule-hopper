const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Tweener = imports.ui.tweener;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Soup = imports.gi.Soup;

var TeamService = function() {
    let path = Me.path + "/data/teams.json";
    let [result, contents] = GLib.file_get_contents(path);
    if (!result) {
        return false;
    }

    let json = JSON.parse(contents);
    let teams = json.league.standard;

    return {
        getTeams: function() {
            return teams;
        },
        getTeamById: function(teamId) {
            return teams.find(function(team) {
                return team["teamId"] == teamId;
            });
        }
    }
};

var GameService = function() {
    let now = new Date();
    let year = "";
    let september = 8;
    if (now.getMonth() >= september) {
        year = now.getFullYear();
    } else {
        year = now.getFullYear() - 1;
    }
    
    let url = "http://data.nba.net/prod/v1/" + year + "/teams/cavaliers/schedule.json";
    let games = [];

    return {
        getAll: function(callback) {
            if (games.length > 0) {
                callback(games);
            } else {
                var request = Soup.Message.new('GET', url);
                var session = new Soup.SessionAsync();
                var that = this;
                session.queue_message(request, function(session, message) {
                    let data = JSON.parse(message.response_body.data);
                    let games = data.league.standard;
                    let now = new Date();
                    that.games = games.filter(function(game) {
                        let dateTime = new Date(game.startTimeUTC);
                        return dateTime >= now;
                    });

                    callback(that.games);
                });
            }
        }
    };
};
