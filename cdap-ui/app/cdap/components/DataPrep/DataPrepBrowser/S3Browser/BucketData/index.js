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


const BucketData = ({data}) => {
  return (<pre> {data}</pre>);
};

BucketData.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
};

const mapStateToProps = (state) => {
  return {
    data: state.s3.data
  };
};

const BucketDataWrapper = connect(
  mapStateToProps
)(BucketData);

const BucketDataView = () => (
  <Provider store={DataPrepBrowserStore}>
    <BucketDataWrapper />
  </Provider>
);
export default BucketDataView;
