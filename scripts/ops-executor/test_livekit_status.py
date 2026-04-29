import unittest


class TestParseLivekitStatus(unittest.TestCase):
    def test_parse_json_ps_running(self):
        import sys
        import os

        sys.path.insert(0, os.path.dirname(__file__))
        from ops_executor import parse_compose_ps_json

        raw = [
            {
                "Name": "tailchat-livekit-1",
                "Service": "livekit",
                "State": "running",
                "Status": "Up 3 minutes",
                "Publishers": [
                    {"URL": "0.0.0.0:7880", "TargetPort": 7880, "Protocol": "tcp"},
                    {"URL": "0.0.0.0:7881", "TargetPort": 7881, "Protocol": "tcp"},
                ],
                "Image": "livekit/livekit-server:latest",
            }
        ]

        data = parse_compose_ps_json(raw)
        self.assertEqual(data["state"], "running")
        self.assertEqual(data["containerName"], "tailchat-livekit-1")
        self.assertEqual(data["image"], "livekit/livekit-server:latest")
        self.assertIn("0.0.0.0:7880->7880/tcp", data["ports"])
        self.assertEqual(data["uptime"], "Up 3 minutes")


if __name__ == "__main__":
    unittest.main()
