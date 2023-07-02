/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

!(function (t) {
    var e,
        n,
        o,
        l,
        c,
        i,
        d =
            '<svg><symbol id="flow-node-iconplay" viewBox="0 0 1024 1024"><path d="M102.425742 102.393565v819.148516l614.361387-409.574258z" fill="" ></path><path d="M153.622524 102.393565v819.148516l614.361387-409.574258z" fill="" ></path><path d="M259.599863 15.871003V834.507551l619.481066-405.478515z" fill="" ></path><path d="M261.135767 189.428094l-1.535904 818.636549L875.497154 599.002353z" fill="" ></path><path d="M204.819306 102.393565m-102.393564 0a102.393565 102.393565 0 1 0 204.787129 0 102.393565 102.393565 0 1 0-204.787129 0Z" fill="" ></path><path d="M819.180694 409.574258c-56.316461 0-102.393565 46.077104-102.393565 102.393565s46.077104 100.345693 102.393565 102.393564c57.852364 2.047871 102.905532-45.053168 102.393564-102.393564-0.511968-56.316461-46.077104-102.393565-102.393564-102.393565zM204.819306 819.148517c-56.316461 0-102.393565 46.077104-102.393564 102.393564s46.077104 100.345693 102.393564 102.393565c53.756621 2.047871 100.857661-45.053168 102.393565-102.393565 1.535903-56.316461-46.077104-102.393565-102.393565-102.393564z" fill="" ></path></symbol><symbol id="flow-node-icondelete" viewBox="0 0 1024 1024"><path d="M836.6 193.8h100.2c18.8 0 33.9-16.2 33.9-36.3s-15.1-35.2-33.9-35.2H724.9V85.9C724.9 40 690 2 646.6 2H377.9c-42.8 0-78.3 37.5-78.3 83.9v36.3H87.2c-18.8 0-33.9 16.2-33.9 36.3s15.1 36.3 33.9 36.3h100.2l649.2-1zM804.6 253.7l-585.2 1c-20.5 0-37.2 17.6-37.2 39.2V890c0 72.6 56.3 132 125.1 132h409.4c68.8 0 125.1-59.4 125.1-132V293c0-21.7-16.7-39.3-37.2-39.3z"  ></path></symbol><symbol id="flow-node-iconsuspend" viewBox="0 0 1024 1024"><path d="M757.52 73.107h-62.493c-34.526 0-62.498 27.984-62.498 62.511v749.948c0 34.526 27.974 62.493 62.498 62.493h62.493c34.516 0 62.502-27.968 62.502-62.493v-749.953c-0.001-34.524-27.984-62.509-62.502-62.509z"  ></path><path d="M320.054 73.107h-62.502c-34.526 0-62.498 27.984-62.498 62.511v749.948c0 34.526 27.974 62.493 62.498 62.493h62.502c34.505 0 62.493-27.968 62.493-62.493v-749.953c-0.001-34.524-27.984-62.509-62.493-62.509z"  ></path></symbol></svg>',
        a = (a = document.getElementsByTagName('script'))[a.length - 1].getAttribute(
            'data-injectcss',
        );
    if (a && !t.__iconfont__svg__cssinject__) {
        t.__iconfont__svg__cssinject__ = !0;
        try {
            document.write(
                '<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>',
            );
        } catch (t) {
            console && console.log(t);
        }
    }
    function s() {
        c || ((c = !0), o());
    }
    (e = function () {
        var t, e, n, o;
        ((o = document.createElement('div')).innerHTML = d),
            (d = null),
            (n = o.getElementsByTagName('svg')[0]) &&
                (n.setAttribute('aria-hidden', 'true'),
                (n.style.position = 'absolute'),
                (n.style.width = 0),
                (n.style.height = 0),
                (n.style.overflow = 'hidden'),
                (t = n),
                (e = document.body).firstChild
                    ? ((o = t), (n = e.firstChild).parentNode.insertBefore(o, n))
                    : e.appendChild(t));
    }),
        document.addEventListener
            ? ~['complete', 'loaded', 'interactive'].indexOf(document.readyState)
                ? setTimeout(e, 0)
                : ((n = function () {
                      document.removeEventListener('DOMContentLoaded', n, !1), e();
                  }),
                  document.addEventListener('DOMContentLoaded', n, !1))
            : document.attachEvent &&
              ((o = e),
              (l = t.document),
              (c = !1),
              (i = function () {
                  try {
                      l.documentElement.doScroll('left');
                  } catch (t) {
                      return void setTimeout(i, 50);
                  }
                  s();
              })(),
              (l.onreadystatechange = function () {
                  'complete' == l.readyState && ((l.onreadystatechange = null), s());
              }));
})(window);
