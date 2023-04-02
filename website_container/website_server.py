import flask
import threading
import os

class WebsiteServer(threading.Thread):
    def __init__(self) -> None:
        threading.Thread.__init__(self)

        self.app = flask.Flask(__name__, template_folder=os.path.join("frontend", os.path.dirname((__file__))))

        @self.app.route('/')
        def index():
            return flask.render_template('pages/index.html')

        @self.app.route('/join')
        def join():
            return flask.render_template('pages/join.html')

    
    def run(self):
        print("[Website] Starting website server")
        self.app.run(host='0.0.0.0', port=5800, debug=False)

    



if __name__ == '__main__':
    website = WebsiteServer()
    website.start()

