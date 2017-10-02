/*
 * Copyright © 2017 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
*/

import React, {PropTypes} from 'react';
import DataPrepBrowserStore from 'components/DataPrep/DataPrepBrowser/DataPrepBrowserStore';
import {connect, Provider} from 'react-redux';
import {Link} from 'react-router-dom';

const BucketsList = ({buckets}) => {
  let pathname = window.location.pathname.replace(/\/cdap/, '');
  return (
    <div>
      <div className="s3-content-header">
        <div className="row">
          <div className="col-xs-4">
            Name
          </div>
          <div className="col-xs-4">
            Owner
          </div>
          <div className="col-xs-4">
            Last Modified
          </div>
        </div>
      </div>
      <div className="s3-content-body">
        <div className="s3-buckets">
          {
            buckets.map(bucket => (
              <Link to={`${pathname}/${bucket.name}`}>
                <div className="row">
                  <div className="col-xs-4">
                    {bucket.name}
                  </div>
                  <div className="col-xs-4">
                    {bucket.owner['display-name']}
                  </div>
                  <div className="col-xs-4">
                    {bucket['creation-date']}
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  );
};

BucketsList.propTypes = {
  buckets: PropTypes.arrayOf(PropTypes.object)
};


const mapStateToProps = (state) => {
  return {
    buckets: state.s3.buckets
  };
};

// const mapDispatchToProps = (dispatch) => {

// }

const BucketsListWrapper = connect(
  mapStateToProps
)(BucketsList);

const Buckets = () => (
  <Provider store={DataPrepBrowserStore}>
    <BucketsListWrapper />
  </Provider>
);

export default Buckets;
