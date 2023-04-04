import flask
import threading
import os
import Constants
from colorama import Fore


class WebsiteServer(threading.Thread):
    def __init__(self, game_code: str) -> None:
        threading.Thread.__init__(self)

        ROOT = os.path.dirname((__file__))
        self.game_code = game_code
        self.app = flask.Flask(__name__,
                               template_folder=os.path.join(ROOT, "pages"),
                               static_folder=os.path.join(ROOT, "static"))

        @self.app.route('/')
        def index():
            return flask.render_template('index.html')

        @self.app.route(f'/{game_code}')
        def join():
            return flask.render_template('game.html')

        @self.app.errorhandler(404)
        def page_not_found(e):
            return flask.render_template('game_not_found.html'), 404

    def run(self):
        print("[Website] Starting website server")

        self.app.run(host='0.0.0.0',
                     port=Constants.NetworkConfig.website_port, debug=False)


if __name__ == '__main__':
    website = WebsiteServer()
    website.start()
